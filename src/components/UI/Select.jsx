import React from 'react';

import Select from 'react-select';
import { colourOptions } from '../data';

const SelectOption = () => (
  <Select
    defaultValue={[colourOptions[2], colourOptions[3]]}
    name='colors'
    options={colourOptions}
    className='basic-multi-select'
    classNamePrefix='select'
  />
);

export default SelectOption;
