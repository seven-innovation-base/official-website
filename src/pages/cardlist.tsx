import React from 'react';
import { Card, Col, Row, Slider, Collapse, Tag } from 'antd';
import 'antd/dist/antd.css';
const { Panel } = Collapse;



function cardlist(props){
    let datas = []
    datas = props.datas
    return(
    <>
        <Collapse defaultActiveKey={['1']}>
        {datas.map((data, index) => (
            // key有问题，我想展开的是第一栏(key->data.index)
            <Panel header={data.aword} key={data.key} extra={<Tag color={data.color}>{data.count}人</Tag>}>
                <p>{data.member + ' '}</p>
            </Panel>
        ))}
        </Collapse>
    </>
    )
}

export default cardlist;