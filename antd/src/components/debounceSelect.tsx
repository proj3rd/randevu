import { Select, SelectProps, Spin } from "antd";
import { SelectValue } from "antd/lib/select";
import { debounce } from 'lodash';
import { useMemo, useRef, useState } from "react";

type Props = {
  fetchFunc: (value: string) => Promise<any[]>;
  timeout: number;
} & SelectProps<SelectValue>;

export default function DebounceSelect(props: Props) {
  const { fetchFunc, timeout, ...restProps } = props;
  const [options, setOptions] = useState<any[]>([]);
  const [waiting, setWaiting] = useState(false);
  const fetchRef = useRef(0);

  const debounceFetcher = useMemo(() => {
    const loadOptions = (value: string) => {
      if (!value) {
        return;
      }
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setOptions([]);
      setWaiting(true);
      fetchFunc(value).then((newOptions) => {
        if (fetchId !== fetchRef.current) {
          // for fetch callback order
          return;
        }

        setOptions(newOptions);
        setWaiting(false);
      });
    };

    return debounce(loadOptions, timeout);
  }, [fetchFunc, timeout]);

  return (
    <Select
      options={options}
      onSearch={debounceFetcher}
      notFoundContent={waiting ? <Spin /> : null}
      loading={waiting}
      {...restProps}
    />
  );
}
