import { Controller, useFormContext } from 'react-hook-form';
import Input from '@components/atoms/Input';
import Textarea from '@components/atoms/Textarea';
import Select from '@components/atoms/Select';

/**
 * Wrapper de react-hook-form para los átomos de formulario.
 * Debe usarse dentro de un <FormProvider methods={methods}>.
 * type: 'text' | 'email' | 'password' | 'number' | 'date' | 'textarea' | 'select'
 */
const FormField = ({
  name,
  label,
  type = 'text',
  placeholder,
  helperText,
  options,
  required,
  ...props
}) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const error = errors[name]?.message;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        if (type === 'textarea') {
          return (
            <Textarea
              {...field}
              label={label}
              error={error}
              helperText={helperText}
              placeholder={placeholder}
              required={required}
              {...props}
            />
          );
        }
        if (type === 'select') {
          return (
            <Select
              {...field}
              label={label}
              error={error}
              helperText={helperText}
              options={options ?? []}
              placeholder={placeholder}
              required={required}
              {...props}
            />
          );
        }
        return (
          <Input
            {...field}
            type={type}
            label={label}
            error={error}
            helperText={helperText}
            placeholder={placeholder}
            required={required}
            {...props}
          />
        );
      }}
    />
  );
};

export default FormField;
