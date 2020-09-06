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
