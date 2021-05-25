import { Collapse, Form, Input, Modal, Radio, RadioChangeEvent, Select } from "antd";
import { useForm } from "antd/lib/form/Form";
import { ModalProps } from 'antd/lib/modal';
import axios from "axios";
import { DocEnum, DocOperator, DocPackage } from "randevu-shared/dist/types";
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
  const [form] = useForm();

  const [operatorList, setOperatorList] = useState<DocOperator[]>([]);
  const [packageMainList, setPackageMainList] = useState<DocPackage[]>([]);
  const [deploymentOptionList, setDeploymentOptionList] = useState<DocEnum[]>([]);
  const [productList, setProductList] = useState<DocEnum[]>([]);
  const [ranSharingList, setRanSharingList] = useState<DocEnum[]>([]);

  const [packageType, setPackageType] = useState('main');

  function onChangePackageType(e: RadioChangeEvent) {
    const packageType = e.target.value ?? 'main';
    setPackageType(packageType);
    if (packageType === 'sub') {
      if (!operatorList.length) {
        axios.get('/operators').then((response) => {
          const operatorList = response.data as DocOperator[];
          setOperatorList(operatorList);
        }).catch((reason) => {
          console.error(reason);
        });
      }
      if (!packageMainList.length) {
        axios.get('/packages/main').then((response) => {
          const packageMainList = response.data as DocPackage[];
          setPackageMainList(packageMainList);
        }).catch((reason) => {
          console.error(reason);
        });
      }
      if (!deploymentOptionList.length) {
        axios.get('/deployment-options').then((response) => {
          const deploymentOptionList = response.data as DocEnum[];
          setDeploymentOptionList(deploymentOptionList);
        }).catch((reason) => {
          console.error(reason);
        });
      }
      if (!productList.length) {
        axios.get('/products').then((response) => {
          const productList = response.data as DocEnum[];
          setProductList(productList);
        }).catch((reason) => {
          console.error(reason);
        });
      }
      if (!ranSharingList.length) {
        axios.get('/ran-sharing').then((response) => {
          const ranSharingList = response.data as DocEnum[];
          setRanSharingList(ranSharingList);
        }).catch((reason) => {
          console.error(reason);
        });
      }
    }
  }

  return (
    <Modal
      {...modalProps}
      title='Create a package'
    >
      <Form
        form={form}
        initialValues={{
          packageType: 'main',
        }}
        {...layout}
      >
        <Form.Item
          name='name'
          label='Name'
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label='Package type'
          name='packageType'
        >
          <Radio.Group onChange={onChangePackageType}>
            <Radio value='main'>Main</Radio>
            <Radio value='sub'>Sub</Radio>
          </Radio.Group>
        </Form.Item>
        <Collapse activeKey={packageType}>
          <Collapse.Panel header='Sub package information' key='sub'>
            <Form.Item
              label='Main package'
              name='main'
              rules={[{ required: packageType === 'sub' }]}
            >
              <Select>
                {
                  packageMainList.map((packageMain) => {
                    const { _id, name } = packageMain;
                    return (
                      <Select.Option key={_id} value={_id}>{name}</Select.Option>
                    )
                  })
                }
              </Select>
            </Form.Item>
            <Form.Item
              label='Operator'
              name='operator'
              rules={[{ required: packageType === 'sub' }]}
            >
              <Select>
                {
                  operatorList.map((operator) => {
                    const { _id, name } = operator;
                    return (
                      <Select.Option key={_id} value={_id}>{name}</Select.Option>
                    )
                  })
                }
              </Select>
            </Form.Item>
            <Form.Item
              label='Owner'
              name='owner'
              rules={[{ required: packageType === 'sub' }]}
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
              <Select
                mode='multiple'
                allowClear
              >
                {
                  deploymentOptionList.map((deploymentOption) => {
                    const { _id, name } = deploymentOption;
                    return (
                      <Select.Option key={_id} value={_id}>{name}</Select.Option>
                    )
                  })
                }
              </Select>
            </Form.Item>
            <Form.Item
              label='Products'
              name='productList'
            >
              <Select
                mode='multiple'
                allowClear
              >
                {
                  productList.map((product) => {
                    const { _id, name } = product;
                    return (
                      <Select.Option key={_id} value={_id}>{name}</Select.Option>
                    )
                  })
                }
              </Select>
            </Form.Item>
            <Form.Item
              label='RAN sharing'
              name='ranSharingList'
            >
              <Select
                mode='multiple'
                allowClear
              >
                {
                  ranSharingList.map((ranSharing) => {
                    const { _id, name } = ranSharing;
                    return (
                      <Select.Option key={_id} value={_id}>{name}</Select.Option>
                    )
                  })
                }
              </Select>
            </Form.Item>
          </Collapse.Panel>
        </Collapse>
      </Form>
    </Modal>
  )
}
