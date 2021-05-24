import { Collapse, Form, Input, Modal, Radio, RadioChangeEvent, Select } from "antd";
import { ModalProps } from 'antd/lib/modal';
import { useState } from "react";

type Props = {
  onOk?: (e: React.MouseEvent<HTMLElement>) => void;
  onCancel?: (e: React.MouseEvent<HTMLElement>) => void;
} & ModalProps;

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

export default function ModalCreatePackage({ ...modalProps }: Props) {
  const [packageType, setPackageType] = useState('main');

  function onChangePackageType(e: RadioChangeEvent) {
    setPackageType(e.target.value ?? 'main');
  }

  return (
    <Modal
      {...modalProps}
      title='Create a package'
      forceRender={true}
    >
      <Form
        {...layout}
      >
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
          <Radio.Group name='packageType' defaultValue={packageType} onChange={onChangePackageType}>
            <Radio value='main'>Main</Radio>
            <Radio value='sub'>Sub</Radio>
          </Radio.Group>
        </Form.Item>
        <Collapse activeKey={packageType}>
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
