import { EntityMap } from '@console/shared';
import { validateDNS1123SubdomainValue, ValidationErrorType } from '../common';

export const validateNicName = (name: string, interfaceLookup: EntityMap<any>) => {
  let validation = validateDNS1123SubdomainValue(name);

  if (!validation && interfaceLookup[name]) {
    validation = {
      type: ValidationErrorType.Error,
      message: 'Interface with this name already exists!',
    };
  }

  return validation;
};
