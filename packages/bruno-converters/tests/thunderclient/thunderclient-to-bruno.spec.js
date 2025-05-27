import { describe, it, expect } from '@jest/globals';
import thunderClientToBruno from '../../src/thunderclient/thunderclient-to-bruno';

describe('thunderclient-collection', () => {
  it('should correctly import a valid ThunderClient file', async () => {
    const brunoCollection = thunderClientToBruno(thunderClientCollectionString);

    expect(brunoCollection).toMatchObject(expectedOutput);
  });
});

const thunderClientCollectionString = {
  "_id": "c25c347a-b132-4165-8007-c71656293fa0",
  "colName": "Hello World Thunder Client",
  "created": "2025-03-04711:42:36.687Z",
  "sortNum": 50000,
  "folders": [],
  "requests": [
    {
      "_id": "5a149799-c52a-4a99-b670-ba430fdc55dc",
      "colId": "c25c347a-b132-4165-8007-c71656293fa0",
      "containerld": "",
      "name": "Request1",
      "url": "https://httpbin.org/get",
      "method": "GET",
      "sortNum": 20000,
      "created": "2025-03-04711:43:12.060Z",
      "modified": "2025-03-04711:43:25.813Z",
      "headers": []
    },
    {
      "_id": "d6b35203-de6b-48db-8465-6695a5326251",
      "colId": "c25c347a-b132-4165-8007-c71656293fa0",
      "containerId": "",
      "name": "Request2",
      "url": "https://httpbin.org/get",
      "method": "GET",
      "sortNum": 60000,
      "created": "2025-03-04T11:45:50.199Z",
      "modified": "2025-05-15712:24:49.937Z",
      "headers": [
        {
          "name": "User-Agent",
          "value": "Thunder Client (https://hww.thunderclient.com)",
          "isDisabled": true
        }
      ]
    },
    {
      "_id": "f2071005-fb9c-4630-abbb-b6d7031722f3",
      "colId": "c25c347a-b132-4165-8007-c71656293fa0",
      "containerld": "",
      "name": "Request3",
      "url": "https://httpbin.org/get",
      "method": "GET",
      "sortNum": 70000,
      "created": "2025-03-04T11:46:17.355Z",
      "modified": "2025-03-04711:46:21.683Z",
      "headers": []
    }
  ]
};

const expectedOutput = {
  "name": "Hello World Thunder Client",
  "version": "1",
  "items": [
    {
      "type": "folder",
      "name": "Hello World Thunder Client",
      "filename": "Hello World Thunder Client",
      "seq": 1,
      "items": [
        {
          "type": "http",
          "name": "Request1",
          "filename": "Request1.bru",
          "seq": 1,
          "request": {
            "url": "https://httpbin.org/get",
            "method": "GET",
            "headers": [],
            "params": [],
            "body": {
              "mode": "none",
              "formUrlEncoded": [],
              "multipartForm": [],
              "file": []
            },
            "script": {},
            "vars": {},
            "assertions": [],
            "tests": "",
            "docs": "",
            "auth": {
              "mode": "none"
            }
          }
        },
        {
          "type": "http",
          "name": "Request2",
          "filename": "Request2.bru",
          "seq": 2,
          "request": {
            "url": "https://httpbin.org/get",
            "method": "GET",
            "headers": [
              {
                "name": "User-Agent",
                "value": "Thunder Client (https://hww.thunderclient.com)",
                "enabled": false
              }
            ],
            "params": [],
            "body": {
              "mode": "none",
              "formUrlEncoded": [],
              "multipartForm": [],
              "file": []
            },
            "script": {},
            "vars": {},
            "assertions": [],
            "tests": "",
            "docs": "",
            "auth": {
              "mode": "none"
            }
          }
        },
        {
          "type": "http",
          "name": "Request3",
          "filename": "Request3.bru",
          "seq": 3,
          "request": {
            "url": "https://httpbin.org/get",
            "method": "GET",
            "headers": [],
            "params": [],
            "body": {
              "mode": "none",
              "formUrlEncoded": [],
              "multipartForm": [],
              "file": []
            },
            "script": {},
            "vars": {},
            "assertions": [],
            "tests": "",
            "docs": "",
            "auth": {
              "mode": "none"
            }
          }
        }
      ]
    }
  ],
  "environments": [],
  "brunoConfig": {
    "version": "1",
    "name": "Hello World Thunder Client",
    "type": "collection",
    "ignore": [
      "node_modules",
      ".git"
    ],
    "size": 0,
    "filesCount": 1
  }
};