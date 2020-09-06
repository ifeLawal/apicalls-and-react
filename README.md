# React Github Jobs Site Using the Github API
The idea behind this project is to recreate the github jobs page using the github jobs API and react.js. We clean up the interface a little and focus using API calls with react.

> This repo is HEAVILY based on the tutorial by [Web Dev Simplified](https://www.youtube.com/channel/UCFbNIlppjAuEX4znoulh0Cw). He has a host of amazing tutorials helping boost developer skills and stacks. This repo is more or less my own explanations of what the process, concepts, and logic were for executing that project.

There are three main divisions: setting up the API calls and sending the data to the app, loading that data to the app, and implementing user interactions (search, page selection, etc.)

## Notes on setting up the API
We utilize react hooks and axios, which come built into the create react app node modules.

#### App.js
```javascript
import { useReducer, useEffect } from 'react'
import axios from 'axios'
```

React hooks help us manage the state of the API calls and send the appropriate state of the data as we pull it using the axios HTTP request GET functionality.

***

Our reducer function sends through the state of our data, so we define the 3 main actions that occur / can occur as we retrieve the data (make request, get data, and error) and how state will look after those action calls. The dispatch sends the action and state to the reducer, this starts out as empty as we currently have no data, but gets updated when axios makes a GET data request.

##### App.js
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
##### App.js
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

##### package.json
```javascript
"proxy": "https://jobs.github.com",
```

(right above the dependencies), this avoids cors request errors and has our axios.get request sent to jobs.github rather than to localhost:port while developing ([read more about  react app proxy here](https://create-react-app.dev/docs/proxying-api-requests-in-development/)). Also our **PROXY_URL**, inside of UseFetchJobs.js, for axios.get is set to the github jobs API GET path: '/positions.json'.

***

Now that the data is piping in, we can move on to displaying that information in a list format with filter functionality and pagination.

## Rendering data to the page

Our first focus is rending each job. In react, this type of work is done using components. By breaking segments of the UI into components we allow for reuse across the app as well as reusing a component on the same page with an array of data.

***

To make the process of building this UI fast and responsive, we import [bootstrap for react](https://react-bootstrap.github.io/getting-started/introduction)

##### In command line
```shell
npm install react-bootstrap
```

We end up using the Card, Badge, Button, and Collapse components from react bootstrap

```javascript
import { Card, Badge, Button, Collapse } from 'react-bootstrap'
```

We also include the latest bootstrap cdn inside of our index.html file to have our system load the className css from bootstrap we plan to use inside our react code.

##### index.html
```html
<link
      rel="stylesheet"
      href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css"
      integrity="sha384-9aIt2nRpC12Uk9gS9baDl411NQApFmC26EwAOH8WgZl5MYYxFfc+NcPb1dKGj7Sk"
      crossorigin="anonymous"
    />
```

Additionally we also install react-markdown to read the jobs api markdown jobs details.

##### In command line
```shell
npm install react-markdown
```

With all this prepped we pass in the job object as a prop to our Job component and use this data to return a component that displays all our Job information.

##### Jobs.js
```javascript
export default function Job({ job }) {

return (
        <div>
            <Card className="mb-3">
                <Card.Body>
                    <div className="d-flex justify-content-between">
                        <div>
                            <Card.Title>
                                {job.title} - <span className="text-muted font-weight light">{job.company}</span>
                            </Card.Title>
                            <Card.Subtitle className="text-muted mb-2">
                                {new Date(job.created_at).toLocaleDateString()}
                            </Card.Subtitle>
                            <Badge variant="secondary" className="mr-2">
                                {job.type}
                            </Badge>
                            <Badge variant="secondary">
                                {job.location}
                            </Badge>
                            <div style={{wordBreak: 'break-all'}} >
                                <ReactMarkdown source={job.how_to_apply} />
                            </div>
                        </div>
                        <img alt={job.company} className="d-none d-md-block" height="50" src={job.company_logo} />
                    </div>
                    <Card.Text>
                        <Button  onClick={handleOpen}
                        variant="primary">{open ? "Hide Details" : "View Details"}</Button>
                    </Card.Text>
                    <Collapse in={open}>
                        <div className="mt-4">
                            <ReactMarkdown source={job.description} />
                        </div>
                    </Collapse>
                </Card.Body>
            </Card>
            
        </div>
    )
```

We also end up including a state for our job component to handle collapsing and extending our job description information. This shows one of the huge benefits of reach hooks because before we would need to make our Job component into a react class to make it stateful, but with hooks we just include useState and have an open variable that utilizes this state.

##### Job.js
```javascript
import React, { useState } from 'react'

export default function Job({ job }) {

const [open, setOpen] = useState(false);

    function handleOpen() {
        setOpen(!open);
    }
...
```

We then set up the search form to effectively filter through our components. Once again using bootstrap to quickly create a clean form design. This time we only pass the parameters that will be filtered for in as props and the method to send what parameter is being filtered and what value we are filtering with to the App who will then handle this parameter change.

#### SearchForm.js
```javascript
import React from 'react'
import { Form, Col } from 'react-bootstrap'

export default function SearchForm({params, onParamChange}) {
    return (
        <Form className="mb-4">
            <Form.Row>
                <Form.Group as={Col}>
                    <Form.Label>Description</Form.Label>
                    <Form.Control onChange={onParamChange} value={params.description} name="description" type="input" />
                </Form.Group>
                <Form.Group as={Col}>
                    <Form.Label>Location</Form.Label>
                    <Form.Control onChange={onParamChange} value={params.location} name="location" type="input" />
                </Form.Group>
            </Form.Row>
        </Form>
    )
}
```


Finally we set up the pagination. We use bootstrap's built in pagination elements for the styling. We pass in as props, the page, a setPage method to flow the page change up to the parent app to handle this change and a hasNextPage boolean to figure out when to stop paginating next. 

##### JobsPagination.js
```javascript
import React from 'react'
import { Pagination } from 'react-bootstrap'

export default function JobsPagination({page, setPage, hasNextPage}) {
    function adjustPage(amount) {
        setPage(prevPage => prevPage + amount);
    }


    return (
        <Pagination>
            {page !== 1 && <Pagination.Prev onClick={() => adjustPage(-1)} />}
            {page !== 1 && <Pagination.Item onClick={() => setPage(1)}>1</Pagination.Item>}
            {page > 2 && <Pagination.Ellipsis></Pagination.Ellipsis>}
            {page > 2 && <Pagination.Item onClick={() => adjustPage(-1)}>{page - 1}</Pagination.Item>}
            <Pagination.Item active>{page}</Pagination.Item>
            {hasNextPage && <Pagination.Item onClick={() => adjustPage(1)}>{page + 1}</Pagination.Item>}
            {hasNextPage && <Pagination.Next onClick={() => adjustPage(1)} />}
        </Pagination>
    )
}
```

***

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app) and the awesome teachings of [Kyle from Web Dev Simplified](https://www.youtube.com/channel/UCFbNIlppjAuEX4znoulh0Cw)
