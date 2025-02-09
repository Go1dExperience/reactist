import * as React from 'react'
import { BaseField, FieldComponentProps } from '../base-field'
import { Box } from '../box'
import styles from './select-field.module.css'

type SelectFieldProps = FieldComponentProps<HTMLSelectElement>

const SelectField = React.forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField(
    {
        id,
        label,
        secondaryLabel,
        auxiliaryLabel,
        hint,
        maxWidth,
        children,
        hidden,
        'aria-describedby': ariaDescribedBy,
        ...props
    },
    ref,
) {
    return (
        <BaseField
            id={id}
            label={label}
            secondaryLabel={secondaryLabel}
            auxiliaryLabel={auxiliaryLabel}
            hint={hint}
            maxWidth={maxWidth}
            hidden={hidden}
            aria-describedby={ariaDescribedBy}
        >
            {(extraProps) => (
                <Box className={styles.selectWrapper}>
                    <select {...props} {...extraProps} ref={ref}>
                        {children}
                    </select>
                    <SelectChevron aria-hidden />
                </Box>
            )}
        </BaseField>
    )
})

function SelectChevron(props: JSX.IntrinsicElements['svg']) {
    return (
        <svg width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
            <path
                d="M11.646 5.646a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 1 1 .708-.708L8 9.293l3.646-3.647z"
                fill="currentColor"
            />
        </svg>
    )
}

export { SelectField }
export type { SelectFieldProps }
