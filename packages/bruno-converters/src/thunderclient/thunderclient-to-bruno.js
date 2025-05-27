import each from 'lodash/each';
import get from 'lodash/get';
import { validateSchema, transformItemsInCollection, hydrateSeqInCollection, uuid } from '../common';

const ensureUrl = (url) => {
  // removing multiple slashes after the protocol if it exists, or after the beginning of the string otherwise
  return url.replace(/([^:])\/{2,}/g, '$1/');
};

const buildEmptyJsonBody = (bodySchema) => {
  let _jsonBody = {};
  each(bodySchema.properties || {}, (prop, name) => {
    if (prop.type === 'object') {
      _jsonBody[name] = buildEmptyJsonBody(prop);
    } else if (prop.type === 'array') {
      if (prop.items && prop.items.type === 'object') {
        _jsonBody[name] = [buildEmptyJsonBody(prop.items)];
      } else {
        _jsonBody[name] = [];
      }
    } else {
      _jsonBody[name] = '';
    }
  });
  return _jsonBody;
};

const transformThunderClientRequestItem = (request) => {
  const brunoRequestItem = {
    uid: uuid(),
    name: request.name,
    type: 'http-request',
    request: {
      url: ensureUrl(request.url),
      method: request.method.toUpperCase(),
      auth: {
        mode: 'none',
        basic: null,
        bearer: null,
        digest: null
      },
      headers: [],
      params: [],
      body: {
        mode: 'none',
        json: null,
        text: null,
        xml: null,
        formUrlEncoded: [],
        multipartForm: []
      },
      script: {
        res: null
      }
    }
  };

  each(request.parameters || [], (param) => {
    if (param.in === 'query') {
      brunoRequestItem.request.params.push({
        uid: uuid(),
        name: param.name,
        value: '',
        description: param.description || '',
        enabled: param.required,
        type: 'query'
      });
    } else if (param.in === 'path') {
      brunoRequestItem.request.params.push({
        uid: uuid(),
        name: param.name,
        value: '',
        description: param.description || '',
        enabled: param.required,
        type: 'path'
      });
    } else if (param.in === 'header') {
      brunoRequestItem.request.headers.push({
        uid: uuid(),
        name: param.name,
        value: '',
        description: param.description || '',
        enabled: param.required
      });
    }
  });

  let auth;
  // allow operation override
  if (request.security && request.security.length > 0) {
    let schemeName = Object.keys(request.security[0])[0];
    auth = request.global.security.getScheme(schemeName);
  } else if (request.global && request.global.security.supported.length > 0) {
    auth = request.global.security.supported[0];
  }

  if (auth) {
    if (auth.type === 'http' && auth.scheme === 'basic') {
      brunoRequestItem.request.auth.mode = 'basic';
      brunoRequestItem.request.auth.basic = {
        username: '{{username}}',
        password: '{{password}}'
      };
    } else if (auth.type === 'http' && auth.scheme === 'bearer') {
      brunoRequestItem.request.auth.mode = 'bearer';
      brunoRequestItem.request.auth.bearer = {
        token: '{{token}}'
      };
    } else if (auth.type === 'apiKey' && auth.in === 'header') {
      brunoRequestItem.request.headers.push({
        uid: uuid(),
        name: auth.name,
        value: '{{apiKey}}',
        description: 'Authentication header',
        enabled: true
      });
    }
  }

  if (request.headers) {
    each(request.headers, (header) => {
      brunoRequestItem.request.headers.push({
        uid: uuid(),
        name: header.name,
        value: header.value,
        enabled: !header.isDisabled
      });
    });
  }

  // TODO: handle allOf/anyOf/oneOf
  if (request.requestBody) {
    let content = get(request, 'requestBody.content', {});
    let mimeType = Object.keys(content)[0];
    let body = content[mimeType] || {};
    let bodySchema = body.schema;
    if (mimeType === 'application/json') {
      brunoRequestItem.request.body.mode = 'json';
      if (bodySchema && bodySchema.type === 'object') {
        let _jsonBody = buildEmptyJsonBody(bodySchema);
        brunoRequestItem.request.body.json = JSON.stringify(_jsonBody, null, 2);
      }
      if (bodySchema && bodySchema.type === 'array') {
        brunoRequestItem.request.body.json = JSON.stringify([buildEmptyJsonBody(bodySchema.items)], null, 2);
      }
    } else if (mimeType === 'application/x-www-form-urlencoded') {
      brunoRequestItem.request.body.mode = 'formUrlEncoded';
      if (bodySchema && bodySchema.type === 'object') {
        each(bodySchema.properties || {}, (prop, name) => {
          brunoRequestItem.request.body.formUrlEncoded.push({
            uid: uuid(),
            name: name,
            value: '',
            description: prop.description || '',
            enabled: true
          });
        });
      }
    } else if (mimeType === 'multipart/form-data') {
      brunoRequestItem.request.body.mode = 'multipartForm';
      if (bodySchema && bodySchema.type === 'object') {
        each(bodySchema.properties || {}, (prop, name) => {
          brunoRequestItem.request.body.multipartForm.push({
            uid: uuid(),
            type: 'text',
            name: name,
            value: '',
            description: prop.description || '',
            enabled: true
          });
        });
      }
    } else if (mimeType === 'text/plain') {
      brunoRequestItem.request.body.mode = 'text';
      brunoRequestItem.request.body.text = '';
    } else if (mimeType === 'text/xml') {
      brunoRequestItem.request.body.mode = 'xml';
      brunoRequestItem.request.body.xml = '';
    }
  }

  return brunoRequestItem;
};

const resolveRefs = (spec, components = spec?.components, cache = new Map()) => {
  if (!spec || typeof spec !== 'object') {
    return spec;
  }

  if (cache.has(spec)) {
    return cache.get(spec);
  }

  if (Array.isArray(spec)) {
    return spec.map(item => resolveRefs(item, components, cache));
  }

  if ('$ref' in spec) {
    const refPath = spec.$ref;

    if (cache.has(refPath)) {
      return cache.get(refPath);
    }

    if (refPath.startsWith('#/components/')) {
      const refKeys = refPath.replace('#/components/', '').split('/');
      let ref = components;

      for (const key of refKeys) {
        if (ref && ref[key]) {
          ref = ref[key];
        } else {
          return spec;
        }
      }

      cache.set(refPath, {});
      const resolved = resolveRefs(ref, components, cache);
      cache.set(refPath, resolved);
      return resolved;
    }
    return spec;
  }

  const resolved = {};
  cache.set(spec, resolved);

  for (const [key, value] of Object.entries(spec)) {
    resolved[key] = resolveRefs(value, components, cache);
  }

  return resolved;
};

export const parseThunderClientCollection = (data) => {
  const brunoCollection = {
    name: '',
    uid: uuid(),
    version: '1',
    items: [],
    environments: []
  };
  try {
    const collectionData = resolveRefs(data);
    if (!collectionData) {
      throw new Error('Invalid Thunder Client collection. Failed to resolve refs.');
    }

    brunoCollection.name = collectionData.colName;
    brunoCollection.items = [{
      uid: uuid(),
      name: collectionData.colName,
      type: 'folder',
      items: collectionData.requests.map(transformThunderClientRequestItem)
    }];

    return brunoCollection;
  } catch (err) {
    console.error(err);
    throw new Error('An error occurred while parsing the Thunder Client collection');
  }
};

export const thunderClientToBruno = (thunderClientSpecification) => {
  try {
    const collection = parseThunderClientCollection(thunderClientSpecification);
    const transformedCollection = transformItemsInCollection(collection);
    const hydratedCollection = hydrateSeqInCollection(transformedCollection);
    const validatedCollection = validateSchema(hydratedCollection);

    return validatedCollection
  } catch (err) {
    console.error(err);
    throw new Error('Import collection failed');
  }
};

export default thunderClientToBruno;
