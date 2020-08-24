import { useReducer, useEffect } from 'react'
import axios from 'axios'


const ACTIONS = {
    MAKE_REQUEST: "make-request",
    GET_DATA: "get-data",
    ERROR: "error"
}

const HEROKU_CORS = "https://cors-anywhere.herokuapp.com/"
const BASE_URL = "https://jobs.github.com/positions.json";
const PROXY_URL = "/positions.json";
const CORS_URL = HEROKU_CORS + BASE_URL;

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

export default function useFetchJobs(params, page) {
    const [state, dispatch] = useReducer(reducer, { jobs: [], loading: true, error: false});

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


    // dispatch( { type: "hello", payload: {x:3}});

    return state;
}