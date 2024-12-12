import React, { useState } from 'react'
import './index.css'
import searchImage1 from '../../images/search/search_icon.png'
import searchImage2 from '../../images/search/search_list_open.png'
import searchImage3 from '../../images/search/search_list_close.png'
import { Collapse, Typography, Select, Input, Button, Form } from 'antd';
import { useHistory } from 'react-router-dom'

const { Panel } = Collapse;
const { Paragraph } = Typography;

const layout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 16,
  },
};

export default function Search() {

  const history = useHistory();

  const [activePanel, setActivePanel] = useState('1');

  const handlePanelClick = (panelKey) => {
    setActivePanel(panelKey);
  };


  const headerInfo = (param, num) => {
    return (
      activePanel.includes(num) ?
        <span style={{ color: '#2b84a0', }}>
          <img src={searchImage1} alt='' style={{maxWidth: '10px',maxHeight: '10px'
          }} />
          &nbsp;&nbsp;{param}
          <img src={searchImage3} alt='' style={{float: 'right',objectFit: "cover",maxWidth: '42px',maxHeight: '42px'
          }} />
        </span> 
        :
        <span style={{ color: '#2b84a0' }}>
          <img src={searchImage1} alt='' style={{ maxWidth: '10px', maxHeight: '10px' }} />
          &nbsp;&nbsp;{param}
          <img src={searchImage2} alt='' style={{ float: 'right', objectFit: "cover", maxWidth: '42px', maxHeight: '42px' }} />
        </span>
    )
  }

  const [form] = Form.useForm();

  const [form2] = Form.useForm();

  const [form3] = Form.useForm();

  const [typeChange1, setTypeChange1] = useState(1);
  const [typechange2, setTypeChange2] = useState(1);

  const [grchTypeChange1, setGrchTypeChange1] = useState(1);


  const onFill = () => {
    form.setFieldsValue({
      introduction: typeChange1 === 1 ? "rs80338940" :
        typeChange1 === 2 && grchTypeChange1 === 1 ? "chr13:20766921-C-T" :
          typeChange1 === 2 && grchTypeChange1 === 2 ? "chr13:20192782-C-T" :
            typeChange1 === 3 && grchTypeChange1 === 1 ? "chr13:20766872-20767101" :
              typeChange1 === 3 && grchTypeChange1 === 2 ? "chr13:20192699-20192802" :
                typeChange1 === 4 ? "GJB2" : ""
    });
    setText(typeChange1 === 1 ? "rs80338940" :
      typeChange1 === 2 && grchTypeChange1 === 1 ? "chr13:20766921-C-T" :
        typeChange1 === 2 && grchTypeChange1 === 2 ? "chr13:20192782-C-T" :
          typeChange1 === 3 && grchTypeChange1 === 1 ? "chr13:20766872-20767101" :
            typeChange1 === 3 && grchTypeChange1 === 2 ? "chr13:20192699-20192802" :
              typeChange1 === 4 ? "GJB2" : "")
  };

  const onFill2 = () => {
    form2.setFieldsValue({
      introduction2: typechange2 === 1 ? 'ENSG00000165474' :
        typechange2 === 2 ? 'GJB2' : ''
    })
    setText2(typechange2 === 1 ? 'ENSG00000165474' :
      typechange2 === 2 ? 'GJB2' : '')
  };

  const onFill3 = () => {
    form3.setFieldsValue({
      introduction3: 'Waardenburg anophthalmia syndrome'
    })
    setText3("Waardenburg anophthalmia syndrome")
  };


  const onchange1 = (value) => {
    setTypeChange1(value);
  }

  const onchange2 = (value) => {
    setTypeChange2(value)
  }

  const grchChange1 = (value) => {
    setGrchTypeChange1(value)
  }

  const [text, setText] = useState('');


  const [text2, setText2] = useState('');


  const [text3, setText3] = useState('');
  const [text4, setText4] = useState('');

  const handleJoinWithCommas = (event) => {
    const lines = event.target.value.split('\n');
    console.log(lines)
    const textWithCommas = lines.join(','); // 使用逗号分隔文本行
    setText(textWithCommas);
  };

  const handleJoinWithCommas2 = (event) => {
    const lines = event.target.value.split('\n');
    const textWithCommas = lines.join(','); // 使用逗号分隔文本行
    setText2(textWithCommas);
  };

  const handleJoinWithCommas3 = (event) => {
    const lines = event.target.value.split('\n');
    const textWithCommas = lines.join(','); // 使用逗号分隔文本行
    setText3(textWithCommas);
  };

  return (
    <div  style={{
      padding: '20px',
      backgroundColor: 'white',
      // margin: 'auto',
      paddingTop: '10px',
      // paddingBottom: '80px',
      minHeight: ''
    }}
      className='SearchName contend-div-height'>
      <Collapse accordion bordered={false} prefixCls='col-1' style={{
        // backgroundColor: '#2b84a0', 
        width: '96%',

      }}
        onChange={handlePanelClick}
        activeKey={activePanel}>
        
        <Panel header={headerInfo('Keywords Search', '1')} key="1" style={activePanel.includes('1') ? { backgroundColor: '', borderRadius: '6px' } : {}}>
          <div style={{ padding: '28px 80px' }}>
            <div>
              <div style={{ fontSize: '20px' }}>TIPS:</div>
            </div>
            <Paragraph style={{ color: '#727272', marginBottom: '30px' }}>
              Please choose input type and genome version, then provide variants or genomic location.
            </Paragraph>
            <Form
              {...layout}
              form={form}
              name="nest-messages1"
              onFinish={(value) => history.push('/search_rsid?type=' + value.rsIdSelect + '&version=' + value.rsIdSelect2 + '&data=' + text)}
              initialValues={{ rsIdSelect: 1, rsIdSelect2: 1 }}
            >
              <Form.Item id='rsIdSelect' name={['rsIdSelect']} label={
                (
                  <div style={{ width: '80px', textAlign: 'left' }}>Genomic</div>
                )
              } labelCol="span:3,offset:8">
                <Select onChange={onchange1} >
                  <Select.Option value={1}>Euphorbia_lathyris</Select.Option>
                  <Select.Option value={2}>Ricinus_communis_culivated</Select.Option>
                  <Select.Option value={3}>Ricinus_communis_wild</Select.Option>
                  <Select.Option value={4}>Vernicia_fordii</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name={['rsIdSelect2']} label={
                (
                  <div style={{ width: '80px', textAlign: 'left' }}>Search type:</div>
                )
              } labelCol="span:3,offset:8">
                <Select onChange={grchChange1} className='SelectOption'>
                  <Select.Option value={1}>GRCh37</Select.Option>
                  <Select.Option value={2}>GRCh38</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name={['introduction']}
                rules={[{
                  required: true,
                  message: "The query conditions cannot be empty!"
                }
                ]}>
                <Input.TextArea placeholder={typeChange1 === 1 ? "rs80338940" :
                  typeChange1 === 2 && grchTypeChange1 === 1 ? "chr13:20766921-C-T" :
                    typeChange1 === 2 && grchTypeChange1 === 2 ? "chr13:20192782-C-T" :
                      typeChange1 === 3 && grchTypeChange1 === 1 ? "chr13:20766872-20767101" :
                        typeChange1 === 3 && grchTypeChange1 === 2 ? "chr13:20192699-20192802" :
                          typeChange1 === 4 ? "GJB2" : ""

                }
                  onChange={handleJoinWithCommas}
                  value={text}
                />
              </Form.Item>
              <Form.Item
                wrapperCol={{
                  ...layout.wrapperCol,
                  offset: 8,
                }}
                labelCol
              >
                <Button type="primary"
                  htmlType="submit"
                  style={{
                    marginRight: '20px',
                    backgroundColor: '#258fb3'
                  }}>
                  Submit
                </Button>
                <Button htmlType="reset" onClick={() => setTypeChange1(1)} style={{ marginRight: '20px', backgroundColor: '#e6b92e', color: 'white' }}>
                  Reset
                </Button>
                <Button htmlType="button" onClick={onFill} style={{ backgroundColor: '#6fa8dd', color: 'white' }}>
                  Example
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Panel>
        <Panel header={headerInfo('Location Search', '2')} key="2" style={activePanel.includes('2') ? { backgroundColor: '#e6b92e' } : {}}>
          <div style={{ padding: '28px 80px' }}>
            <div>
              <div style={{ fontSize: '20px' }}>TIPS:</div>
            </div>
            <Paragraph style={{ color: '#727272', marginBottom: '30px' }}>
              Please choose input type and genome version, then provide variants or genomic location.
            </Paragraph>
            <Form
              {...layout}
              form={form2}
              name="nest-messages2"
              onFinish={(value) => history.push('/search_gene?type=' + value.rsIdSelect + '&version=' + value.rsIdSelect2 + '&data=' + text2)}
              initialValues={{ rsIdSelect: 1, rsIdSelect2: 1 }}
            >
              <Form.Item name={['rsIdSelect']} label={
                (
                  <div style={{ width: '80px', textAlign: 'left' }}>Type</div>
                )
              } labelCol="span:3,offset:8">
                <Select onChange={onchange2}>
                  <Select.Option value={1}>Gene id</Select.Option>
                  <Select.Option value={2}>Gene symbol</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name={['rsIdSelect2']} label={
                (
                  <div style={{ width: '80px', textAlign: 'left' }}>Version</div>
                )
              } labelCol="span:3,offset:8">
                <Select>
                  <Select.Option value={1}>GRCh37</Select.Option>
                  <Select.Option value={2}>GRCh38</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name={['introduction2']}
                rules={[{
                  required: true,
                  message: "The query conditions cannot be empty!"
                }]}>
                <Input.TextArea placeholder={typechange2 === 1 ? "ENSG00000165474" :
                  typechange2 === 2 ? "GJB2" : ""
                }
                  onChange={handleJoinWithCommas2}
                  value={text}
                />
              </Form.Item>
              <Form.Item
                wrapperCol={{
                  ...layout.wrapperCol,
                  offset: 8,
                }}
                labelCol
              >
                <Button type="primary" htmlType="submit" style={{ marginRight: '20px', backgroundColor: '#258fb3' }}>
                  Submit
                </Button>
                <Button htmlType="reset" onClick={() => setTypeChange2(1)} style={{ marginRight: '20px', backgroundColor: '#e6b92e', color: 'white' }}>
                  Reset
                </Button>
                <Button htmlType="button" onClick={onFill2} style={{ backgroundColor: '#6fa8dd', color: 'white' }}>
                  Example
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Panel>
        <Panel header={headerInfo('Transcription Regulator', '3')} key="3" style={activePanel.includes('3') ? { backgroundColor: '#e6b92e' } : {}}>
          <div style={{ padding: '28px 80px' }}>
            <div>
              <div style={{ fontSize: '20px' }}>TIPS:</div>
            </div>
            <Paragraph style={{ color: '#727272', marginBottom: '30px' }}>
              Please choose input type and genome version, then provide variants or genomic location.
            </Paragraph>
            <Form
              {...layout}
              form={form3}
              name="nest-messages3"
              onFinish={(value) => history.push('/search_disease?version=' + value.rsIdSelect2 + '&data=' + text3)}
              initialValues={{ rsIdSelect2: 1 }}
            >
              <Form.Item name={['rsIdSelect2']} label={
                (
                  <div style={{ width: '80px', textAlign: 'left' }}>Version</div>
                )
              } labelCol="span:3,offset:8">
                <Select>
                  <Select.Option value={1}>GRCh37</Select.Option>
                  <Select.Option value={2}>GRCh38</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name={['introduction3']} rules={[{
                required: true,
                message: "The query conditions cannot be empty!"
              }]}>
                <Input.TextArea placeholder="Waardenburg anophthalmia syndrome"
                  onChange={handleJoinWithCommas3}
                  value={text} />
              </Form.Item>
              <Form.Item
                wrapperCol={{
                  ...layout.wrapperCol,
                  offset: 8,
                }}
                labelCol
              >
                <Button type="primary" htmlType="submit" style={{ marginRight: '20px', backgroundColor: '#258fb3' }}>
                  Submit
                </Button>
                <Button htmlType="reset" style={{ marginRight: '20px', backgroundColor: '#e6b92e', color: 'white' }}>
                  Reset
                </Button>
                <Button htmlType="button" onClick={onFill3} style={{ backgroundColor: '#6fa8dd', color: 'white' }}>
                  Example
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Panel>
        <Panel header={headerInfo('Transcription Regulator', '4')} key="4" style={activePanel.includes('4') ? { backgroundColor: '#e6b92e' } : {}}>
          <div style={{ padding: '28px 80px' }}>
            <div>
              <div style={{ fontSize: '20px' }}>TIPS:</div>
            </div>
            <Paragraph style={{ color: '#727272', marginBottom: '30px' }}>
              Please choose input type and genome version, then provide variants or genomic location.
            </Paragraph>
            <Form
              {...layout}
              form={form3}
              name="nest-messages3"
              onFinish={(value) => history.push('/search_disease?version=' + value.rsIdSelect2 + '&data=' + text3)}
              initialValues={{ rsIdSelect2: 1 }}
            >
              <Form.Item name={['rsIdSelect2']} label={
                (
                  <div style={{ width: '80px', textAlign: 'left' }}>Version</div>
                )
              } labelCol="span:3,offset:8">
                <Select>
                  <Select.Option value={1}>GRCh37</Select.Option>
                  <Select.Option value={2}>GRCh38</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name={['introduction3']} rules={[{
                required: true,
                message: "The query conditions cannot be empty!"
              }]}>
                <Input.TextArea placeholder="Waardenburg anophthalmia syndrome"
                  onChange={handleJoinWithCommas3}
                  value={text} />
              </Form.Item>
              <Form.Item
                wrapperCol={{
                  ...layout.wrapperCol,
                  offset: 8,
                }}
                labelCol
              >
                <Button type="primary" htmlType="submit" style={{ marginRight: '20px', backgroundColor: '#258fb3' }}>
                  Submit
                </Button>
                <Button htmlType="reset" style={{ marginRight: '20px', backgroundColor: '#e6b92e', color: 'white' }}>
                  Reset
                </Button>
                <Button htmlType="button" onClick={onFill3} style={{ backgroundColor: '#6fa8dd', color: 'white' }}>
                  Example
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Panel>
      </Collapse>
      {/* <hr style={{ marginTop: '50px', border: 'none', borderTop: '1px solid #ccc', height: '1px' }} /> */}
      {/* <div style={{ border: '1px solid #ccc', padding: '20px', marginTop: '30px' }}>
        <h2>Features:</h2>
        <Paragraph>
          1) <span style={{ color: '#2b84a0' }}>Search supe-enhancers by tissue category-based:</span> Based on the tissue query, users can guery the super-enhancer for al samples of a particular type of tisue
        </Paragraph>
        <Paragraph>
          2) <span style={{ color: '#2b84a0' }}>Search super-enhancers by gene-based:</span> in the gene-based query, users can query a gene of interest and SEdb wll return al super-enhancers that match thesuper-enhancer-gene relationship for all samples
        </Paragraph>
        <Paragraph>
          3) <span style={{ color: '#2b84a0' }}>Search super-enhancer by genomic region:</span> n the sample-based advanced query users deltermine he scope of the super-enhancer query by delermining the sample and genome
          location for the results of interest.
        </Paragraph>
      </div> */}
    </div >
  )
}
