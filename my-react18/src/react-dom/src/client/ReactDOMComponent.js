/*
 * @Author: 刘天福/YC002047
 * @Date: 2023-01-06 15:24:53
 * @Description: 
 */
import setTextContent from './setTextContent';
import { setValueForStyles } from './CSSPropertyOperations';
import { setValueForProperty } from './DOMPropertyOperations';

const CHILDREN = 'children';
const STYLE = 'style';

function setInitialDOMProperties (domElement, tag, nextProps, isCustomComponentTag) {
    for (const propKey in nextProps) {
        if (nextProps.hasOwnProperty(propKey)) {
            const nextProp = nextProps[propKey];
            if (propKey === STYLE) {
                setValueForStyles(domElement, nextProp);
            } else if (propKey === CHILDREN) {
                if (typeof nextProp === 'string') {
                    setTextContent(domElement, nextProp);
                } else if (typeof nextProp === 'number') {
                    setTextContent(domElement, `${nextProp}`);
                }
            } else if (nextProp != null) {
                setValueForProperty(domElement, propKey, nextProp);
            }
        }
    }
}

export function setInitialProperties (domElement, tag, nextProps) {
    setInitialDOMProperties (domElement, tag, nextProps)
}

export function diffProperties(domElement, tag, lastProps, nextProps) {
    let updatePayload = null;
    let propKey;
    let styleName;
    let styleUpdates = null; 
    for (propKey in lastProps) {
        if (
          nextProps.hasOwnProperty(propKey) ||
          !lastProps.hasOwnProperty(propKey) ||
          lastProps[propKey] == null
        ) {
          continue;
        }
        if (propKey === STYLE) {
            const lastStyle = lastProps[propKey];
            for (styleName in lastStyle) {
              if (lastStyle.hasOwnProperty(styleName)) {
                if (!styleUpdates) {
                  styleUpdates = {};
                }
                styleUpdates[styleName] = '';
              }
            }
        } else {
            (updatePayload = updatePayload || []).push(propKey, null);
        }
    }
    for (propKey in nextProps) {
        const nextProp = nextProps[propKey];
        const lastProp = lastProps != null ? lastProps[propKey] : undefined;
        if (
          !nextProps.hasOwnProperty(propKey) ||
          nextProp === lastProp ||
          (nextProp == null && lastProp == null)
        ) {
          continue;
        }
        if (propKey === STYLE) {
          if (lastProp) {
            // Unset styles on `lastProp` but not on `nextProp`.
            for (styleName in lastProp) {
              if (
                lastProp.hasOwnProperty(styleName) &&
                (!nextProp || !nextProp.hasOwnProperty(styleName))
              ) {
                if (!styleUpdates) {
                  styleUpdates = {};
                }
                styleUpdates[styleName] = '';
              }
            }
            // Update styles that changed since `lastProp`.
            for (styleName in nextProp) {
              if (
                nextProp.hasOwnProperty(styleName) &&
                lastProp[styleName] !== nextProp[styleName]
              ) {
                if (!styleUpdates) {
                  styleUpdates = {};
                }
                styleUpdates[styleName] = nextProp[styleName];
              }
            }
          } else {
            // Relies on `updateStylesByID` not mutating `styleUpdates`.
            if (!styleUpdates) {
              if (!updatePayload) {
                updatePayload = [];
              }
              updatePayload.push(propKey, styleUpdates);
            }
            styleUpdates = nextProp;
          }
        } else if (propKey === CHILDREN) {
            if (typeof nextProp === 'string' || typeof nextProp === 'number') {
              (updatePayload = updatePayload || []).push(propKey, '' + nextProp);
            }
        } else {
            // For any other property we always add it to the queue and then we
            // filter it out using the allowed property list during the commit.
            (updatePayload = updatePayload || []).push(propKey, nextProp);
          }
    }
    return updatePayload;
}

export function updateProperties(domElement, updatePayload, tag, oldProps, newProps) {
    updateDOMProperties(domElement, updatePayload);
}

function updateDOMProperties (domElement, updatePayload, wasCustomComponentTag, isCustomComponentTag) {
  // TODO: Handle wasCustomComponentTag
  for (let i = 0; i < updatePayload.length; i += 2) {
    const propKey = updatePayload[i];
    const propValue = updatePayload[i + 1];
    if (propKey === STYLE) {
      setValueForStyles(domElement, propValue);
    } else if (propKey === CHILDREN) {
      setTextContent(domElement, propValue);
    } else {
      setValueForProperty(domElement, propKey, propValue, isCustomComponentTag);
    }
  }
}