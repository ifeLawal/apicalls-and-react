# React Github Jobs Site Using the Github API
The idea behind this project is to recreate the github jobs page using the jobs,github API and react.js. We clean up the interface a little and focus using API calls with react.

There are three main divisions: setting up the API calls and sending the data to the app, loading that data to the app, and implementing user interactions (search, page selection, etc.)

## Notes on setting up the API
We utilize react hooks and axios, which come built into the create react app node modules.

```javascript
import { useReducer, useEffect } from 'react'
import axios from 'axios'
```

React hooks help us manage the state of the API calls and send the appropriate state of the data as we pull it using the axios HTTP request GET functionality.

***

Our reducer function sends through the state of our data, so we define the 3 main actions that occur / can occur as we retrieve the data (make request, get data, and error) and how state will look after those action calls. The dispatch sends the action and state to the reducer, this starts out as empty as we currently have no data, but gets updated when axios makes a GET data request.

```javascript
const [state, dispatch] = useReducer(reducer, { jobs: [], loading: true, error: false});

function reducer(state, action) {
    switch(action.type) {
        case ACTIONS.MAKE_REQUEST:
            return {jobs: [], loading: true};
        case ACTIONS.GET_DATA:
            return {...state, loading: false, jobs: action.payload.jobs };
        case ACTIONS.ERROR:
            return {...state, loading: false, error: action.payload.error, jobs: []};
        default:
            return state;
    }
}
```

This is where we update the empty dispatch. We also wrap the axios get HTTP request in a hook useEffect to cleanup data for the API call (the cleanup happens when we cancel our token). The axios get request pulls the data or throws an error and we send that through our dispatch to update our state appropriately. 

```javascript
useEffect(() => {
        const cancelToken = axios.CancelToken.source();
        dispatch( {type: ACTIONS.MAKE_REQUEST});
        axios.get(PROXY_URL, {
            cancelToken: cancelToken.token,
            params: {markdown: true, page: page, ...params }
        })
        .then(res => {
            dispatch( {type:ACTIONS.GET_DATA, payload: {jobs: res.data}})
        })
        .catch(e => {
            if(axios.isCancel(e)) {return}
            dispatch( {type: ACTIONS.ERROR, payload:{error:  e}} )
        });

        return () => {
            cancelToken.cancel();
        }
    }, [params, page]);
```

One note, we set up a proxy within our package.json 

```javascript
"proxy": "https://jobs.github.com",
```

(right above the dependencies), this avoids cors request errors and has our axios.get request sent to jobs.github rather than to localhost:port while developing ([read more about  react app proxy here](https://create-react-app.dev/docs/proxying-api-requests-in-development/)). Also our **PROXY_URL**, inside of UseFetchJobs.js, for axios.get is set to the github jobs API GET path: '/positions.json'.




This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app) and the awesome teachings of [Kyle from Web Dev Simplified](https://www.youtube.com/channel/UCFbNIlppjAuEX4znoulh0Cw)

## Notes on rendering data to the page

