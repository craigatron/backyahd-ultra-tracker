import datetime
import logging

import firebase_admin
from firebase_admin import firestore


logging.getLogger().setLevel(logging.INFO)

firebase_admin.initialize_app()
db = firestore.client()


def main(request):
    post_body = request.get_json()
    is_dev = post_body.get('dev', False)
    new_row = post_body['submitted']
    logging.info(f'received new row: {new_row}')
    callsign = new_row['name']
    runner_ref = db.collection('dev_runners' if is_dev else 'runners').document(callsign)
    now = datetime.datetime.now()
    runner = runner_ref.get()
    if not runner.exists:
        return f'invalid runner: {callsign}', 400

    runner_dict = runner.to_dict()
    logging.info(f'existing runner: {runner_dict}')

    loop_num = int(new_row['loop'].split('-')[0].strip())

    logging.info(f'updating loop {loop_num} for runner {runner_dict.get("name")}')

    logging.info('updating runner_ref')
    did_quit = new_row.get('quit', '') != 'Yup!'

    new_dict = {
        'updated': now,
        f'loops.{loop_num}': {'quit': did_quit,
                              'finishTime': new_row.get('finishTime'),
                              'trackerLink': new_row.get('trackerLink')}
    }

    max_loop = max(int(n) for n in runner_dict['loops'].keys()) if runner_dict.get('loops') else -1
    if loop_num >= max_loop:
        new_dict['quit'] = did_quit

    logging.info(f'new dict: {new_dict}')
    result = runner_ref.update(new_dict)
    logging.info(f'write result: {result}')

    return 'ok!'
