import { Button, Form, Input, message, Modal, Select, Spin, Tabs } from "antd";
import { useForm } from "antd/lib/form/Form";
import { ModalProps } from 'antd/lib/modal';
import { SelectValue } from "antd/lib/select";
import axios from "axios";
import { DocEnum, DocOperator, DocPackage } from "randevu-shared/dist/types";
import { seqValOf } from "randevu-shared/dist/utils";
import { useState } from "react";
import { getUserListForSelect } from "../utils";
import DebounceSelect from "./debounceSelect";

type Props = {
  onClose?: (refresh?: boolean) => void;
} & ModalProps;

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

export default function ModalCreatePackage({ onClose: onCloseParent, ...modalProps }: Props) {
  const [form] = useForm();

  const [packageMainList, setPackageMainList] = useState<DocPackage[]>([]);
  const [operatorList, setOperatorList] = useState<DocOperator[]>([]);
  const [productList, setProductList] = useState<DocEnum[]>([]);
  const [packagePrevList, setPackagePrevList] = useState<DocPackage[]>([]);
  const [deploymentOptionList, setDeploymentOptionList] = useState<DocEnum[]>([]);
  const [radioAccessTechnologyList, setRadioAccessTechnologyList] = useState<DocEnum[]>([]);
  const [ranSharingList, setRanSharingList] = useState<DocEnum[]>([]);

  const [packageType, setPackageType] = useState('main');
  const [main, setMain] = useState('');
  const [operator, setOperator] = useState('');
  const [product, setProduct] = useState('');
  const [waitingPrev, setWaitingPrev] = useState(false);
  const [waiting, setWaiting] = useState(false);

  function nameSub() {
    return `${main}.${operator}.${product}`;
  }

  function onClose() {
    form.resetFields();
    setPackageType('main');
    setWaiting(false);
    onCloseParent?.();
  }

  function onChangeMain(value: SelectValue, option: any[] | any) {
    const main = option.children ?? '';
    setMain(main);
  }

  function onChangeOperator(value: SelectValue, option: any[] | any) {
    const operator = option.children ?? '';
    setOperator(operator);
    setWaitingPrev(true);
    axios.get(`/operators/${seqValOf(value as string)}/packages`).then((response) => {
      const { data: packagePrevList } = response;
      setPackagePrevList(packagePrevList);
    }).catch((reason) => {
      console.error(reason);
      setPackagePrevList([]);
    }).finally(() => {
      setWaitingPrev(false);
    });
  }

  function onChangeProduct(value: SelectValue, option: any[] | any) {
    const product = option.children ?? '';
    setProduct(product);
  }

  function onChangePackageType(activeKey: string) {
    const packageType = activeKey;
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
      if (!radioAccessTechnologyList.length) {
        axios.get('/radio-access-technologies').then((response) => {
          const radioAccessTechnologyList = response.data as DocEnum[];
          setRadioAccessTechnologyList(radioAccessTechnologyList);
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
    setWaiting(true);
    form.validateFields().then((value) => {
      const name = packageType === 'main' ? form.getFieldValue('name') : nameSub();
      const {
        main,
        operator,
        product,
        owner,
        previous,
        deploymentOptionList: deploymentOptions,
        radioAccessTechnologyList: radioAccessTechnologies,
        ranSharingList: ranSharing,
      } = form.getFieldsValue();
      const sub = packageType === 'main' ? undefined : {
        main,
        operator,
        product,
        owner,
        previous,
        deploymentOptions,
        radioAccessTechnologies,
        ranSharing,
      }
      axios.post('/packages', { name, sub }).then((response) => {
        message.success(`Package ${name} has been created`);
        onClose();
      }).catch((reason) => {
        console.error(reason);
        const errorMessage = reason.response?.data.reason ?? 'Something went wrong. Try again later';
        message.error(errorMessage);
      }).finally(() => {
        setWaiting(false);
      });
    }).catch((reason) => {
      console.error(reason);
    }).finally(() => {
      setWaiting(false);
    });
  }

  return (
    <Modal
      {...modalProps}
      title='Create a package'
      onCancel={onClose}
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
          <Tabs defaultActiveKey='main' onChange={onChangePackageType}>
            <Tabs.TabPane tab='Main' key='main'>
              <Form.Item
                label='Name'
                name='name'
                rules={[{ required: packageType === 'main' }]}
              >
                <Input />
              </Form.Item>
            </Tabs.TabPane>
            <Tabs.TabPane tab='Sub' key='sub'>
              <Form.Item
                label='Name'
              >
                <Input value={`${nameSub()}`} disabled />
              </Form.Item>
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
                  onChange={onChangeMain}
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
                  onChange={onChangeOperator}
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
                label='Product'
                name='product'
                rules={[{ required: packageType === 'sub' }]}
              >
                <Select
                  showSearch
                  filterOption={(input, option) => {
                    return (option?.children.toLocaleString() ?? '').toLocaleLowerCase().indexOf(input.toLocaleLowerCase()) !== -1;
                  }}
                  onChange={onChangeProduct}
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
                label='Owner'
                name='owner'
                rules={[{ required: packageType === 'sub' }]}
              >
                <DebounceSelect
                  showSearch
                  filterOption={(input, option) => {
                    return (option?.label?.toString() ?? '').toLocaleLowerCase().includes(input.toLocaleLowerCase());
                  }}
                  fetchFunc={getUserListForSelect}
                  timeout={500}
                />
              </Form.Item>
              <Form.Item
                label='Previous package'
                name='previous'
              >
                <Select
                  showSearch
                  filterOption={(input, option) => {
                    return (option?.children.toLocaleString() ?? '').toLocaleLowerCase().indexOf(input.toLocaleLowerCase()) !== -1;
                  }}
                  loading={waitingPrev}
                >
                  {
                    packagePrevList.map((packagePrev) => {
                      const { _id, name } = packagePrev;
                      return (
                        <Select.Option key={_id} value={_id}>{name}</Select.Option>
                      )
                    })
                  }
                </Select>
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
                label='Radio access technologies'
                name='radioAccessTechnologyList'
              >
                <Select
                  mode='multiple'
                  allowClear
                  filterOption={(input, option) => {
                    return (option?.children.toLocaleString() ?? '').toLocaleLowerCase().indexOf(input.toLocaleLowerCase()) !== -1;
                  }}
                >
                  {
                    radioAccessTechnologyList.map((radioAccessTechnology) => {
                      const { _id, name } = radioAccessTechnology;
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
            </Tabs.TabPane>
          </Tabs>
          <Form.Item>
            <Button htmlType='submit' hidden></Button>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  )
}
