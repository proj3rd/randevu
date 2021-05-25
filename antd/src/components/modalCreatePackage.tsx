import { Button, Collapse, Form, Input, Modal, Radio, RadioChangeEvent, Select, Spin } from "antd";
import { useForm } from "antd/lib/form/Form";
import { ModalProps } from 'antd/lib/modal';
import axios from "axios";
import { DocEnum, DocOperator, DocPackage } from "randevu-shared/dist/types";
import { useState } from "react";

type Props = {
  onClose?: (refresh?: boolean) => void;
} & ModalProps;

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

export default function ModalCreatePackage({ onClose, ...modalProps }: Props) {
  const [form] = useForm();

  const [operatorList, setOperatorList] = useState<DocOperator[]>([]);
  const [packageMainList, setPackageMainList] = useState<DocPackage[]>([]);
  const [deploymentOptionList, setDeploymentOptionList] = useState<DocEnum[]>([]);
  const [productList, setProductList] = useState<DocEnum[]>([]);
  const [ranSharingList, setRanSharingList] = useState<DocEnum[]>([]);

  const [packageType, setPackageType] = useState('main');
  const [waiting, setWaiting] = useState(false);

  function onCancel() {
    form.setFieldsValue({
      name: '',
      packageType: 'main',
      main: undefined,
      operator: undefined,
      owner: undefined,
      previous: undefined,
      deploymentOptionList: [],
      productList: [],
      ranSharingList: [],
    });
    setPackageType('main');
    setWaiting(false);
    onClose?.();
  }

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

  function onSubmit() {
    form.validateFields().then((value) => {
      setWaiting(true);
      // TODO
    }).catch((reason) => {
      console.error(reason);
    });
  }

  return (
    <Modal
      {...modalProps}
      title='Create a package'
      onCancel={onCancel}
      onOk={onSubmit}
    >
      <Spin spinning={waiting}>
        <Form
          form={form}
          initialValues={{
            packageType: 'main',
          }}
          {...layout}
          onFinish={onSubmit}
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
                <Select
                  showSearch
                  filterOption={(input, option) => {
                    return (option?.children.toLocaleString() ?? '').toLocaleLowerCase().indexOf(input.toLocaleLowerCase()) !== -1;
                  }}
                >
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
                <Select
                  showSearch
                  filterOption={(input, option) => {
                    return (option?.children.toLocaleString() ?? '').toLocaleLowerCase().indexOf(input.toLocaleLowerCase()) !== -1;
                  }}
                >
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
                  filterOption={(input, option) => {
                    return (option?.children.toLocaleString() ?? '').toLocaleLowerCase().indexOf(input.toLocaleLowerCase()) !== -1;
                  }}
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
                  filterOption={(input, option) => {
                    return (option?.children.toLocaleString() ?? '').toLocaleLowerCase().indexOf(input.toLocaleLowerCase()) !== -1;
                  }}
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
                  filterOption={(input, option) => {
                    return (option?.children.toLocaleString() ?? '').toLocaleLowerCase().indexOf(input.toLocaleLowerCase()) !== -1;
                  }}
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
          <Form.Item>
            <Button htmlType='submit' hidden></Button>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  )
}
