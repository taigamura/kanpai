"""Tiny App Store Connect API helper for ワイワイ！ (Apple ID 6805814337).

Uses the shared ASC API key (FM2QG63KF9, .p8 at ~/.appstoreconnect/keys/ on WSL). Import it from
a one-off script:  `import sys; sys.path.insert(0, 'scripts'); from asc import call, APP, VERSION`.

Known ids (version 1.0, ja locale):
  VERSION      appStoreVersion 1.0
  APP_INFO     appInfo (name/subtitle live on its ja appInfoLocalization)
  INFO_LOC     ja appInfoLocalization  -> PATCH name, subtitle
  VER_LOC      ja appStoreVersionLocalization -> PATCH description, keywords, promotionalText
  REVIEW       appStoreReviewDetail -> PATCH notes
  SHOT_SET     APP_IPHONE_65 screenshot set (upload the 1284x2778 files from store-assets/appstore_6.7)
Attach a processed build: PATCH /v1/appStoreVersions/{VERSION}/relationships/build.
Resolution Center replies and "Submit for Review" are done in the ASC web UI.
"""
import json
import os
import time

import jwt
import requests

KEY_ID = 'FM2QG63KF9'
ISSUER = '427cba56-68b8-42ec-b1a8-2f71d5195e53'
KEY = open(os.path.expanduser(f'~/.appstoreconnect/keys/AuthKey_{KEY_ID}.p8')).read()
B = 'https://api.appstoreconnect.apple.com'

APP = '6805814337'
VERSION = '04357a2f-128a-439d-a10b-ce386568f825'
APP_INFO = '682d01ea-f6d8-4ee9-ab57-68b8ae2da5cb'
INFO_LOC = 'e703b1aa-78d8-4e5a-81e2-40802524ef81'
VER_LOC = '1b468fbd-66cd-4703-8c3c-e6afbdf798b7'
REVIEW = '243dfc9d-1023-4d5e-ae7f-96503069b3c7'
SHOT_SET = '7917b148-abeb-416a-8a30-61bd396bbd4b'


def tok():
    now = int(time.time())
    return jwt.encode(
        {'iss': ISSUER, 'iat': now, 'exp': now + 1100, 'aud': 'appstoreconnect-v1'},
        KEY, algorithm='ES256', headers={'kid': KEY_ID, 'typ': 'JWT'},
    )


def call(method, path, body=None):
    """JSON request; prints Apple's error body on 4xx/5xx instead of raising."""
    r = requests.request(
        method, path if path.startswith('http') else B + path,
        headers={'Authorization': 'Bearer ' + tok(), 'Content-Type': 'application/json'},
        data=json.dumps(body) if body is not None else None,
    )
    if r.status_code >= 400:
        print('ERR', method, path, r.status_code, r.text[:1500])
    return r.json() if r.text else {}
