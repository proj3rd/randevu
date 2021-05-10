import { Collapse, Form, Input, Modal, Select, Switch } from "antd";
import { useState } from "react";

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

export default function ModalCreatePackage() {
  const [type, setType] = useState('');

  function onChangeType(checked: boolean, event: MouseEvent) {
    const type = checked ? 'sub' : 'main';
    setType(type);
  }

  return (
    <Modal
      title='Create a package' visible={true}
      onCancel={undefined}
      onOk={undefined}
    >
      <Form {...layout}>
        <Form.Item
          label='Name'
          name='name'
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label='Owner'
          name='owner'
          rules={[{ required: true }]}
        >
            <Select />
        </Form.Item>
        <Form.Item
          label='Package type'
          name='type'
        >
          <Switch
            checkedChildren='Sub'
            unCheckedChildren='Main'
            onChange={onChangeType}
          />
        </Form.Item>
        <Collapse activeKey={type}>
          <Collapse.Panel header='Sub package information' key='sub'>
            <Form.Item
              label='Operator'
              name='operator'
            >
              <Select />
            </Form.Item>
            <Form.Item
              label='Main package'
              name='main'
            >
              <Select />
            </Form.Item>
            <Form.Item
              label='Previous package'
              name='previous'
            >
              <Select />
            </Form.Item>
            <Form.Item
              label='Deployment options'
              name='deploymentOptionList'
            >
              <Select />
            </Form.Item>
            <Form.Item
              label='Products'
              name='productList'
            >
              <Select />
            </Form.Item>
            <Form.Item
              label='RAN sharing'
              name='ranSharingList'
            >
              <Select />
            </Form.Item>
          </Collapse.Panel>
        </Collapse>
      </Form>
    </Modal>
  )
}
