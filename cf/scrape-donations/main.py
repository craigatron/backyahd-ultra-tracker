import datetime
import logging

import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import requests
import flask

logging.getLogger().setLevel(logging.INFO)


def main(event, context):
    cred = credentials.ApplicationDefault()
    firebase_admin.initialize_app(cred)

    db = firestore.client()

    r = requests.get('https://give.thetrevorproject.org/frs-api/fundraising-teams/339922/raised-rankings')
   
    if r.status_code == 200:
        data = r.json()
        rh_entry = list(filter(lambda x: x.get('id') == '339922', data.get('rankingsList', [])))
        if rh_entry and len(rh_entry) == 1:
            rh_entry = rh_entry[0]
            amt = rh_entry['total_raised']
            donations_ref = db.collection('donations').document('donations')
            donations = donations_ref.get().to_dict()
            now = datetime.datetime.now(datetime.timezone.utc)
            logging.info(f'Current time {now}, last updated {donations.get("last_updated")}')
            if 'last_updated' in donations and donations.get('last_updated') > now:
                logging.warning('Invalid update time')
                return flask.abort(400)
            donations_ref.update({
                'amount': int(amt),
                'last_updated': now,
            })
            return 'ok!'
        else:
            logging.error(f'Unexpected response: {data}')
            return flask.abort(400)