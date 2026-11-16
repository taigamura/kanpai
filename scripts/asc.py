"""Tiny App Store Connect API helper for ワイワイ！ (Apple ID 6805814337).

Uses the shared ASC API key (FM2QG63KF9, .p8 at ~/.appstoreconnect/keys/ on WSL). Import it from
a one-off script:  `import sys; sys.path.insert(0, 'scripts'); from asc import call, APP, VERSION`.

Known ids (version 1.0.3, created 2026-11-16; 1.0.2 is live, ja locale). ASC mints NEW ids for every version
(and a new editable appInfo), so re-fetch them after creating the next version and update this file:
  VERSION      appStoreVersion 1.0.3
  APP_INFO     appInfo (name/subtitle live on its ja appInfoLocalization)
  (category: PATCH /v1/appInfos/{APP_INFO} relationships primaryCategory/primarySubcategoryOne/Two/secondaryCategory, ids like GAMES, GAMES_BOARD)
  INFO_LOC     ja appInfoLocalization  -> PATCH name, subtitle (locked while only a live version exists)
  VER_LOC      ja appStoreVersionLocalization -> PATCH description, keywords, promotionalText, whatsNew
  REVIEW       appStoreReviewDetail -> PATCH notes
  SHOT_SET     APP_IPHONE_65 screenshot set (upload the 1284x2778 files from store-assets/appstore_6.7)
Live-version locks: only promotionalText is editable on a READY_FOR_SALE version; marketingUrl,
supportUrl, description, etc. need a new version (PATCH returns 409 STATE_ERROR).
New version: POST /v1/appStoreVersions {platform IOS, versionString, releaseType AFTER_APPROVAL} copies
the previous metadata + screenshots. Bump `expo.version` in app.json to match, then "ship it".
Attach a processed build: PATCH /v1/appStoreVersions/{VERSION}/relationships/build.
Submit for review via API: POST /v1/reviewSubmissions -> POST /v1/reviewSubmissionItems
(appStoreVersion) -> PATCH reviewSubmissions/{id} {submitted: true}. Resolution Center replies are
web-UI only (no API).
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
VERSION = '769fe120-9223-40d3-a861-d08691b4e819'
APP_INFO = '1fe25f26-fa5d-4973-8018-77cf4a977398'
INFO_LOC = '02f70d6d-2ae7-4e9b-bd0f-25fa0e230bd5'
VER_LOC = 'c5fc1947-f2a1-4fd0-936d-0d475ecdadaf'
REVIEW = '9b6b0a37-76cb-41c3-8734-8cef17dc2290'
SHOT_SET = '5c47dc8f-468b-48b1-8178-92f583cd7a1d'


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
