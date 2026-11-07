import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '30s', target: 20 }, // Ramp up to 20 virtual users over 30 seconds
        { duration: '1m', target: 20 },  // Hold 20 virtual users for 1 minute
        { duration: '10s', target: 0 },  // Ramp down to 0 users
    ],
};

export default function () {
    const res = http.get('https://dev.searchtalents.co/');
    check(res, {
        'status is 200': (r) => r.status === 200,
        'response time < 500ms': (r) => r.timings.duration < 500,
    });
    sleep(1);
}