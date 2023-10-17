/*
 * @Author: 刘天福/YC002047
 * @Date: 2023-01-05 09:47:28
 * @Description: 
 */

import {REACT_ELEMENT_TYPE} from 'shared/ReactSymbols';

const RESERVED_PROPS = {
    key: true,
    ref: true,
    __self: true,
    __source: true,
};

const hasOwnProperty = Object.prototype.hasOwnProperty;

function hasValidRef(config) {
    return config.ref !== undefined;
}
  
function hasValidKey(config) {
    return config.key !== undefined;
}


const ReactElement = function(type, key, ref, self, source, owner, props) {
    const element = {
      $$typeof: REACT_ELEMENT_TYPE,
      type: type,
      key: key,
      ref: ref,
      props: props,
      _owner: owner,
    };
    element._store = {};
    Object.defineProperty(element._store, 'validated', {
        configurable: false,
        enumerable: false,
        writable: true,
        value: false,
    });
    Object.defineProperty(element, '_self', {
        configurable: false,
        enumerable: false,
        writable: false,
        value: self,
    });
    Object.defineProperty(element, '_source', {
        configurable: false,
        enumerable: false,
        writable: false,
        value: source,
    });
    if (Object.freeze) {
        Object.freeze(element.props);
        Object.freeze(element);
    }

    return element;
}

export function jsxDEV(type, config, maybeKey, source, self) {
    let propName;
    const props = {}
    let key = null
    let ref = null
    if (hasValidKey(config)) {
        key = '' + config.key;
    }

    if (hasValidRef(config)) {
        ref = config.ref;
    }

    for (propName in config) {
        if (hasOwnProperty.call(config, propName)&&!RESERVED_PROPS.hasOwnProperty(propName)) {
            props[propName] = config[propName]
        }
    }

    return ReactElement(
        type,
        key,
        ref,
        self,
        source,
        undefined, // ReactCurrentOwner.current,
        props,
    );
}