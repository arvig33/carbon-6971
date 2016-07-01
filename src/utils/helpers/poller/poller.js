import { Request } from 'superagent';
import './../promises';

/**
 * A helper to make poll an endpoint with a GET request
 *
 * The helper takes the following params
 * - queryOptions: an object containing the url and optional data object with additional params
 * -- url,
 * -- data
 * - timeout: the time period after which the request is re-submitted
 * - functions: An object containing the custom functions
 * --  conditionMet: Use this to return a test a desired condition and return a boolean.
 * --  callback: A callback function to call when the conditionMet returns true
 * --  handleError: a callback function that takes an error and handles it.
 *
 * ===Example Usage===
 *
 * import poller from 'carbon/lib/utils/helpers/poller';
 *
 * let options = {url: 'http://foo/bar/1'};
 * let timeout = 10000;
 * let functions = {
 *   conditionMet: function(response) => { return response.body.status === 'complete' };
 *   callback: function(response) => { doSomethingFancy(reponse) };
 *   handleError: function(err) => { FlashMessage("Failed", err) };
 *}
 *
 * poller(options, timeout, conditionMet, callback, handleError);
 *
 */
poller(queryOptions, timeout, functions) => {
  return new Promise((resolve, reject) => {
    (poll() => {
       Request
         .get(queryOptions.url)
         .data(queryOptions.data)
         .end((err, response) => {
           if (err) {
             reject(functions.handleError(err));
           } else {
             if (functions.conditionMet(response)) return resolve(functions.callback(response));
             setTimeout(poll, timeout);
           }
         })
     })();
  });
}

export default poller;
