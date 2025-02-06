import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getVisibleCanvases, receiveAnnotation as receiveAnnotationAction } from 'mirador';
import LocalStorageAdapter from '../annotationAdapter/LocalStorageAdapter';
import AnnototAdapter from '../annotationAdapter/AnnototAdapter';
import { AnnotationAdapter } from '../annotationAdapter/AnnotationAdapterUtils';

/** Functional component version of ExternalStorageAnnotation */
function ExternalStorageAnnotation({
  canvases = [],
  config,
  receiveAnnotation,
  PluginComponents = [],
  TargetComponent,
  targetProps,
}) {
  const retrieveAnnotations = useCallback((currentCanvases) => {
    currentCanvases.forEach((canvas) => {
      if (
        typeof config.annotation.adapter === 'string'
        && config.annotation.adapter === AnnotationAdapter.LOCAL_STORAGE
      ) {
        // eslint-disable-next-line no-param-reassign
        config.annotation.adapter = (canvasId) => new LocalStorageAdapter(`localStorage://?canvasId=${canvasId}`);
      }
      if (
        typeof config.annotation.adapter === 'string'
        && config.annotation.adapter === AnnotationAdapter.ANNOTOT
      ) {
        const endpointUrl = 'http://127.0.0.1:3000/annotations';
        // eslint-disable-next-line no-param-reassign
        config.annotation.adapter = (canvasId) => new AnnototAdapter(canvasId, endpointUrl);
      }
      if (!config.annotation.adapter) {
        // eslint-disable-next-line no-param-reassign
        config.annotation.adapter = (canvasId) => new LocalStorageAdapter(`localStorage://?canvasId=${canvasId}`);
      }
      const storageAdapter = config.annotation.adapter(canvas.id);

      storageAdapter.all()
        .then((annoPage) => {
          if (annoPage) {
            receiveAnnotation(
              canvas.id,
              storageAdapter.annotationPageId,
              annoPage,
            );
          }
        });
    });
  }, [config, receiveAnnotation]);

  useEffect(() => {
    retrieveAnnotations(canvases);
  }, [canvases, retrieveAnnotations]);

  return (
    <TargetComponent
      {...targetProps} // eslint-disable-line react/jsx-props-no-spreading
      PluginComponents={PluginComponents}
    />
  );
}

ExternalStorageAnnotation.propTypes = {
  canvases: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      index: PropTypes.number,
    }),
  ).isRequired,
  config: PropTypes.shape({
    annotation: PropTypes.shape({
      adapter: PropTypes.func,
    }),
  }).isRequired,
  PluginComponents: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  receiveAnnotation: PropTypes.func.isRequired,
  TargetComponent: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.node,
  ]).isRequired,
  targetProps: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

/** */
const mapDispatchToProps = {
  receiveAnnotation: receiveAnnotationAction,
};

/** */
function mapStateToProps(state, { targetProps }) {
  return {
    canvases: getVisibleCanvases(state, { windowId: targetProps.windowId }),
    config: state.config,
  };
}

const externalStorageAnnotationPlugin = {
  component: ExternalStorageAnnotation,
  mapDispatchToProps,
  mapStateToProps,
  mode: 'wrap',
  target: 'Window',
};

export default externalStorageAnnotationPlugin;
