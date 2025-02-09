import * as React from 'react'
import classNames from 'classnames'
import {
    useTabState,
    Tab as BaseTab,
    TabList as BaseTabList,
    TabPanel as BaseTabPanel,
    TabStateReturn,
} from 'reakit/Tab'
import { Inline } from '../inline'
import { usePrevious } from '../../hooks/use-previous'
import { polymorphicComponent } from '../../utils/polymorphism'
import type { ResponsiveProp } from '../responsive-props'
import type { Space } from '../common-types'

import styles from './tabs.module.css'

const TabsContext = React.createContext<
    (TabStateReturn & Omit<TabsProps, 'children' | 'selectedId'>) | null
>(null)

type TabsProps = {
    /** The `<Tabs>` component must be composed from a `<TabList>` and corresponding `<TabPanel>` components */
    children: React.ReactNode
    /**
     * Determines the primary colour of the tabs
     */
    color?: 'primary' | 'secondary' | 'tertiary'
    /**
     * Determines the style of the tabs
     */
    variant?: 'normal' | 'plain'
    /**
     * The id of the selected tab
     */
    selectedId?: string | null
}

/**
 * Used to group components that compose a set of tabs. There can only be one active tab within the same `<Tabs>` group.
 */
export function Tabs({
    children,
    selectedId,
    color = 'primary',
    variant = 'normal',
}: TabsProps): React.ReactElement {
    const tabState = useTabState({ selectedId })
    const previousSelectedId = usePrevious(selectedId)
    const { selectedId: actualSelectedId, select } = tabState

    React.useEffect(
        function selectTab() {
            if (
                previousSelectedId !== selectedId &&
                selectedId !== actualSelectedId &&
                selectedId !== undefined
            ) {
                select(selectedId)
            }
        },
        [selectedId, actualSelectedId, select, previousSelectedId],
    )

    const memoizedTabState = React.useMemo(
        function memoizeTabState() {
            return {
                ...tabState,
                color,
                variant,
            }
        },
        // There is no guarantee that useTabState returns a stable object when there are no changes, so
        // following reakit/Tab's example we only return a new objet when any of its values have changed
        // eslint-disable-next-line
        [color, variant, ...Object.values(tabState)],
    )

    return <TabsContext.Provider value={memoizedTabState}>{children}</TabsContext.Provider>
}

type TabProps = {
    /** The content to render inside of the tab button */
    children: React.ReactNode

    /** The tab's identifier. This must match its corresponding `<TabPanel>`'s id */
    id: string
}

/**
 * Represents the individual tab elements within the group. Each `<Tab>` must have a corresponding `<TabPanel>` component.
 */
export function Tab({ children, id }: TabProps): React.ReactElement | null {
    const tabContextValue = React.useContext(TabsContext)

    if (!tabContextValue) {
        return null
    }

    const { color, variant, ...tabState } = tabContextValue

    return (
        <BaseTab
            className={classNames(
                styles.tab,
                styles[`tab-${variant ?? ''}`],
                styles[`tab-${color ?? ''}`],
            )}
            id={id}
            {...tabState}
        >
            {children}
        </BaseTab>
    )
}

type TabListProps = (
    | {
          /** Labels the tab list for assistive technologies. This must be provided if `aria-labelledby` is omitted. */
          'aria-label': string
      }
    | {
          /**
           * One or more element IDs used to label the tab list for assistive technologies. Required if
           * `aria-label` is omitted.
           */
          'aria-labelledby': string
      }
    | {
          /**
           * For cases where multiple instances of the tab list exists, the duplicates may be marked as aria-hidden
           */
          'aria-hidden': boolean
      }
) & {
    /**
     * A list of `<Tab>` elements
     */
    children: React.ReactNode

    /**
     * Controls the spacing between tabs
     */
    space?: ResponsiveProp<Space>
}

/**
 * A component used to group `<Tab>` elements together.
 */
export function TabList({
    children,
    space = 'medium',
    ...props
}: TabListProps): React.ReactElement | null {
    const tabContextValue = React.useContext(TabsContext)

    if (!tabContextValue) {
        return null
    }

    const { color, variant, ...tabState } = tabContextValue

    return (
        <BaseTabList {...props} {...tabState}>
            <Inline space={space}>{children}</Inline>
        </BaseTabList>
    )
}

type TabPanelProps = {
    /** The content to be rendered inside the tab */
    children: React.ReactNode

    /** The tabPanel's identifier. This must match its corresponding `<Tab>`'s id */
    id: string

    /**
     * By default, the tab panel's content is always rendered even when they are not active. This behaviour can be changed to
     * 'active', which renders only when the tab is active, and 'lazy', meaning while inactive tab panels will not be rendered
     * initially, they will remain mounted once they are active until the entire Tabs tree is unmounted.
     */
    render?: 'always' | 'active' | 'lazy'
}

/**
 * Used to define the content to be rendered when a tab is active. Each `<TabPanel>` must have a corresponding `<Tab>` component.
 */
export const TabPanel = polymorphicComponent<'div', TabPanelProps, 'omitClassName'>(
    function TabPanel(
        { children, id, as, render = 'always', ...props },
        ref,
    ): React.ReactElement | null {
        const tabContextValue = React.useContext(TabsContext)
        const [tabRendered, setTabRendered] = React.useState(false)
        const tabIsActive = tabContextValue?.selectedId === id

        React.useEffect(
            function trackTabRenderedState() {
                if (!tabRendered && tabIsActive) {
                    setTabRendered(true)
                }
            },
            [tabRendered, tabIsActive],
        )

        if (!tabContextValue) {
            return null
        }

        const { color, variant, ...tabState } = tabContextValue

        return (
            <BaseTabPanel tabId={id} {...tabState} {...props} as={as} ref={ref}>
                {render === 'always' ? children : null}
                {render === 'active' && tabIsActive ? children : null}
                {render === 'lazy' && (tabIsActive || tabRendered) ? children : null}
            </BaseTabPanel>
        )
    },
)

type TabAwareSlotProps = {
    /**
     * Render prop used to provide the content to be rendered inside the slot. The render prop will be
     * called with the current `selectedId`
     */
    children: (provided: { selectedId?: string | null }) => React.ReactElement | null
}

/**
 * Allows content to be rendered based on the current tab being selected while outside of the TabPanel
 * component. Can be placed freely within the main `<Tabs>` component.
 */
export function TabAwareSlot({ children }: TabAwareSlotProps): React.ReactElement | null {
    const tabContextValue = React.useContext(TabsContext)

    return tabContextValue ? children({ selectedId: tabContextValue.selectedId }) : null
}
