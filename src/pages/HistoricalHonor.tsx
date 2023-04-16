import React from 'react';
import { Card, Col, Row, Collapse } from 'antd';
import 'antd/dist/antd.css';
import CardList from "./CardList";

const datas_lanqiao = [
    {
        key: '0',
        member: '1',
        aword: '国家一等奖',
        color: 'purple',
        count: 1
    },
    {
        key: '1',
        member: ['1','2','haha'],
        aword: '国家二等奖',
        color: 'magenta',
        count: 1
    },
    {
        key: '2',
        member: '3',
        aword: '国家三等奖',
        color: 'red',
        count: 1
    },
    {
        key: '3',
        member: ['5','6'],
        aword: '省级一等奖',
        color: 'volcano',
        count: 1,
    },
    {
        key: '4',
        member: ['5','6'],
        aword: '省级二等奖',
        color: 'orange',
        count: 1,
    },
    {
        key: '5',
        member: ['5','6'],
        aword: '省级三等奖',
        color: 'gold',
        count: 1,
    },
];

const datas_mmb = [
    {
        key: '0',
        member: '1',
        aword: '一等奖',
        color: 'purple',
        count: 1
    },
    {
        key: '1',
        member: ['1','2','haha'],
        aword: '二等奖',
        color: 'magenta',
        count: 3
    },
    {
        key: '2',
        member: '3',
        aword: '三等奖',
        color: 'red',
        count: 1
    },
]
const datas_model = [
    {
        key: '0',
        member: '李春明（超级大佬）',
        aword: '知网研学奖',
        color: 'purple',
        count: 1
    },
    {
        key: '1',
        member: '1',
        aword: '国家一等奖',
        color: 'magenta',
        count: 1
    },
    {
        key: '2',
        member: '2',
        aword: '国家二等奖',
        color: 'red',
        count: 1
    },
        {
        key: '3',
        member: '1',
        aword: '省级一等奖',
        color: 'volcano',
        count: 1,
    },
    {
        key: '4',
        member: ['5','6'],
        aword: '省级二等奖',
        color: 'orange',
        count: 1,
    },
    {
        key: '5',
        member: ['5','6'],
        aword: '省级三等奖',
        color: 'gold',
        count: 1,
    },
]

function HistoricalHonor() {
     return (
            <>
                <div className="container">
                    <div className="text--center margin-vert--lg">
                        <h1>近年参赛获奖</h1>
                        <p>很多，还在整理当中，下面展示是近年国家级、省部级获奖的一部分......</p>
                    </div>
                </div>
                <Row gutter={16}>
                    <Col span={8}>
                        <Card title="蓝桥杯" bordered={false}>
                                <CardList datas={datas_lanqiao}></CardList>
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card title="mathorcup杯" bordered={false}>
                            <Collapse defaultActiveKey={['1']}>
                                <CardList datas={datas_mmb}></CardList>
                            </Collapse>
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card title="数模" bordered={false}>
                            <Collapse defaultActiveKey={['1']}>
                                <CardList datas={datas_model}></CardList>
                            </Collapse>
                        </Card>
                    </Col>
                </Row>
            </>

        )
}


export default HistoricalHonor


