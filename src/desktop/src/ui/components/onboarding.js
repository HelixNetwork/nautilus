import React, { Component } from 'react'
import {Container, Row, Col} from 'react-bootstrap'
import css from './onboarding.scss';
export class OnboardingLayout extends Component {
    render() {
        return (
            <Container>
               <Row className="show-grid">
                    <Col xs={1} md={4}></Col>
                    <Col xs={4} md={4}>{this.props.children}</Col>
                    <Col xs={1} md={4}></Col>
                </Row>
            </Container>
        )
    }
}

export default OnboardingLayout
