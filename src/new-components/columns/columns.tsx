import * as React from 'react'
import { polymorphicComponent } from '../../utils/polymorphism'
import { getClassNames, mapResponsiveProp } from '../responsive-props'
import { Box } from '../box'

import type { ResponsiveProp, ResponsiveBreakpoints } from '../responsive-props'
import type { Space } from '../common-types'
import type { ReusableBoxProps } from '../box'

import styles from './columns.module.css'

type ColumnWidth =
    | 'auto'
    | 'content'
    | '1/2'
    | '1/3'
    | '2/3'
    | '1/4'
    | '3/4'
    | '1/5'
    | '2/5'
    | '3/5'
    | '4/5'

interface ColumnProps {
    width?: ColumnWidth
}

const Column = polymorphicComponent<'div', ColumnProps>(function Column(
    { width = 'auto', children, exceptionallySetClassName, ...props },
    ref,
) {
    return (
        <Box
            {...props}
            className={[
                exceptionallySetClassName,
                styles.column,
                width !== 'content'
                    ? getClassNames(styles, 'columnWidth', width.replace('/', '-'))
                    : null,
            ]}
            minWidth={0}
            width={width !== 'content' ? 'full' : undefined}
            flexShrink={width === 'content' ? 0 : undefined}
            ref={ref}
        >
            {children}
        </Box>
    )
})

type ColumnsHorizontalAlignment = 'left' | 'center' | 'right'
type ColumnsVerticalAlignment = 'top' | 'center' | 'bottom' | 'baseline'
type ColumnsCollapseBelow = ResponsiveBreakpoints

interface ColumnsProps extends ReusableBoxProps {
    space?: ResponsiveProp<Space>
    align?: ResponsiveProp<ColumnsHorizontalAlignment>
    alignY?: ResponsiveProp<ColumnsVerticalAlignment>
    collapseBelow?: ResponsiveBreakpoints
}

const Columns = polymorphicComponent<'div', ColumnsProps>(function Columns(
    { space, align, alignY, collapseBelow, children, exceptionallySetClassName, ...props },
    ref,
) {
    return (
        <Box
            {...props}
            className={[exceptionallySetClassName, getClassNames(styles, 'space', space)]}
            flexDirection={
                collapseBelow === 'desktop'
                    ? ['column', 'column', 'row']
                    : collapseBelow === 'tablet'
                    ? ['column', 'row']
                    : 'row'
            }
            display="flex"
            alignItems={mapResponsiveProp(alignY, (alignY) => {
                switch (alignY) {
                    case 'top':
                        return 'flexStart'

                    case 'bottom':
                        return 'flexEnd'

                    case 'baseline':
                        return 'baseline'

                    case 'center':
                    default:
                        return 'center'
                }
            })}
            justifyContent={mapResponsiveProp(align, (align) =>
                align === 'left' ? 'flexStart' : align === 'right' ? 'flexEnd' : 'center',
            )}
            flexGrow={1}
            ref={ref}
        >
            {children}
        </Box>
    )
})

export type {
    ColumnProps,
    ColumnsProps,
    ColumnWidth,
    ColumnsCollapseBelow,
    ColumnsHorizontalAlignment,
    ColumnsVerticalAlignment,
}

export { Column, Columns }
