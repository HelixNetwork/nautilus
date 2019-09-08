import React, { Component } from 'react'
import {Container, Row, Col} from 'react-bootstrap'
import css from './onboarding.scss';
import Logos from 'ui/components/logos';
export class OnboardingLayout extends Component {
    render() {
        return (
            <Container>
               <Logos size={20} history={history} />
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
