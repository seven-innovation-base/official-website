import { Row, Col, Typography, Input, Button, Avatar, List, message , Spin ,Modal,Image } from 'antd';
import { UserOutlined, CheckOutlined, QqOutlined, LinkOutlined } from '@ant-design/icons';
import VirtualList from 'rc-virtual-list';
import React from 'react';
import './index.css'
import { useState , useEffect } from 'react';
const { Title } = Typography;
import axios from 'axios';
import { AxieyunAPI } from '../../api';

export default function Registration() {

  var studentId = ''
  var studentName = ''
  var QQnumber=''

const submit = () => {
  console.log('asdasf')
  console.log(studentId)
  console.log(studentName)
  console.log(QQnumber)
  var data = {
    "name": studentName,
    "studentId": studentId,
    "qqNumber" : QQnumber
  };
    axios.post(AxieyunAPI.AxieyunUrl+'/student/add',data)
      .then((res) => {
        console.log(res);
        if (res.status == 201 || res.status == 200) {
          console.log('添加成功')
          Modal.success({
            content: (<div className='image'>
              < h2 > 添加成功</h2 >
              <p>请用QQ/TIM扫描以下二维码进群</p>
              <Image
              width={200}
              src="https://cdn.jsdelivr.net/gh/filess/img7@main/2022/09/28/1664375620509-f45f1f87-2931-4c66-868f-3763fdc2bae1.jpg"></Image>
            </div>),
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  
  }

const [data, setData] = useState([])
const [loading , setloading] = useState(false)
useEffect(() => {
  axios.get(AxieyunAPI.AxieyunUrl+ '/student/getQqList')
    .then((res) => {
      const data1 = new Array();
      for (var i = 0; i < res.data.data.length; i++) {
        var comment = {
          id: i,
          url : 'https://api.vvhan.com/api/qt?qq=' + res.data.data[i]
        }
        data1.push(comment)
      }
      setData(data1)
      
      const loading1 = true;
      setloading(loading1)
    })
}, []);
  
  function inputChange(e) {
  console.log(e)
  studentName = e;
  }
  function inputChange1(e) {
  console.log(e)
  studentName = e;
  }
  function inputChange2(e) {
  console.log(e)
  studentName = e;
  }

  
  return (
    <div className="Registration">
      <Title level={1} className="Section-title">22级新生报名表</Title>
      <p className='Section-p'>想加入基地的22级请填下表然后提交，加入《22级基地新生招新群》，留意基地的招新面试以及培训</p>
      <div className='list'>
      <Row className='liebiao'>
          <Col span={2}>姓名：</Col><Col><Input size="large" placeholder="请输入姓名" prefix={<UserOutlined />}  onChange={(e) => {inputChange(e.target.value)}}/></Col>
    </Row>
    <Row className='liebiao'>
          <Col span={2}>学号：</Col><Col><Input size="large" placeholder="请输入学号" prefix={<LinkOutlined />}   onChange={(e) => {inputChange1(e.target.value)}}  /></Col>
    </Row>
    <Row className='liebiao'>
    <Col span={2}>QQ号：</Col><Col><Input size="large" placeholder="请输入QQ号" prefix={<QqOutlined />}  onChange={(e) => {inputChange2(e.target.value)}} /></Col>
    </Row>
    <Row className='liebiao'>
          <Button type="primary" shape="round" icon={<CheckOutlined />} size="large" onClick={() => submit()} >
        提交
      </Button>
    </Row>
        
      </div>
      <div className='show'>
        已报名的同学：
        {<div>
          {loading ? 
            <List>
            <VirtualList
              data={data}
              itemHeight={47}
              itemKey="id"
            >
              {item => (
                <List.Item key={item.id}>
                      <List.Item.Meta  
                    avatar={<Avatar src={item.url} />}
                  />
                </List.Item>
              )}
            </VirtualList>
          </List>
      : <Spin tip="Loading..." size="large">
    </Spin>} 
    </div> }
    </div>
  </div>
  );
};
