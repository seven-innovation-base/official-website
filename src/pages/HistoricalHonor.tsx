import React from 'react';
import { Card, Col, Row, Collapse } from 'antd';
import 'antd/dist/antd.css';
import CardList from "./CardList";
import {CMCM_members, LanQiao_members, MathorCup_members} from "../data/honormenbers";
import Layout from '@theme/Layout';




function HistoricalHonor() {
     const Contest1 = '比赛1'
     const Contest2 = '比赛2'
     const Contest3 = '比赛3'
     const Contest4 = '比赛4'
     const Contest5 = '比赛5'
     const Contest6 = '比赛6'
     const Contest7 = '比赛7'
     const Contest8 = '比赛8'
     const Contest9 = '比赛9'
     const Contest10 = '比赛10'
     const Contest11 = '比赛11'
     const Contest12 = '比赛12'

     return (
            <Layout >
              <div style={{width: '80%',margin:'auto'}}>
                <div className="container">
                    <div className="text--center margin-vert--lg">
                        <h1>近年参赛获奖</h1>
                        <p>很多，还在整理当中，下面展示是近年国家级、省部级获奖的一部分......</p>
                    </div>
                </div>
                <Row gutter={16}>
                    <Col span={6}>
                        <Card title={Contest1} bordered={false}>
                                <CardList datas={CMCM_members}></CardList>
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card title={Contest2} bordered={false}>
                            <Collapse defaultActiveKey={['1']}>
                                <CardList datas={CMCM_members}></CardList>
                            </Collapse>
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card title={Contest3} bordered={false}>
                            <Collapse defaultActiveKey={['1']}>
                                <CardList datas={CMCM_members}></CardList>
                            </Collapse>
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card title={Contest4} bordered={false}>
                            <Collapse defaultActiveKey={['1']}>
                                <CardList datas={CMCM_members}></CardList>
                            </Collapse>
                        </Card>
                    </Col>
                </Row>
                <Row gutter={32}>
                    <Col span={6}>
                        <Card title={Contest5} bordered={false}>
                                <CardList datas={CMCM_members}></CardList>
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card title={Contest6} bordered={false}>
                            <Collapse defaultActiveKey={['1']}>
                                <CardList datas={CMCM_members}></CardList>
                            </Collapse>
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card title={Contest7} bordered={false}>
                            <Collapse defaultActiveKey={['1']}>
                                <CardList datas={CMCM_members}></CardList>
                            </Collapse>
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card title={Contest8} bordered={false}>
                            <Collapse defaultActiveKey={['1']}>
                                <CardList datas={CMCM_members}></CardList>
                            </Collapse>
                        </Card>
                    </Col>
                </Row>
                <Row gutter={32}>
                    <Col span={6}>
                        <Card title={Contest9} bordered={false}>
                                <CardList datas={CMCM_members}></CardList>
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card title={Contest10} bordered={false}>
                            <Collapse defaultActiveKey={['1']}>
                                <CardList datas={CMCM_members}></CardList>
                            </Collapse>
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card title={Contest11} bordered={false}>
                            <Collapse defaultActiveKey={['1']}>
                                <CardList datas={CMCM_members}></CardList>
                            </Collapse>
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card title={Contest12} bordered={false}>
                            <Collapse defaultActiveKey={['1']}>
                                <CardList datas={CMCM_members}></CardList>
                            </Collapse>
                        </Card>
                    </Col>
                </Row>
                </div>
            </Layout>

        )
}


export default HistoricalHonor


