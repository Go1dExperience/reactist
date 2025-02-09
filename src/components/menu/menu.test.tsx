import * as React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Menu, MenuButton, MenuList, MenuItem } from './menu'
import { axe } from 'jest-axe'

function getFocusedElement() {
    if (!document.activeElement) {
        throw new Error('No element with focus was found')
    }
    return document.activeElement
}

describe('Menu', () => {
    it('renders a button that opens and closes the menu when clicked', () => {
        render(
            <Menu>
                <MenuButton>Options menu</MenuButton>
                <MenuList aria-label="Some options">
                    <MenuItem>First option</MenuItem>
                </MenuList>
            </Menu>,
        )

        // querying by role doesn't work in this case as the menu and menuitem could
        // still be added to the document but as children of a hidden element. To
        // really make sure they're not in the DOM we're querying by text here
        expect(screen.queryByText('First option')).not.toBeInTheDocument()
        userEvent.click(screen.getByRole('button', { name: 'Options menu' }))
        expect(screen.getByRole('menu')).toBeInTheDocument()
        expect(screen.getByRole('menuitem', { name: 'First option' })).toBeInTheDocument()
        userEvent.click(screen.getByRole('button', { name: 'Options menu' }))
        expect(screen.queryByText('First option')).not.toBeInTheDocument()
    })

    it('closes the menu when a menu item is selected (unless the onSelect handler returns false or hideOnSelect is false)', () => {
        render(
            <Menu>
                <MenuButton>Options menu</MenuButton>
                <MenuList aria-label="Some options">
                    <MenuItem onSelect={() => undefined}>First option</MenuItem>
                    <MenuItem onSelect={() => false}>Second option</MenuItem>
                    <MenuItem onSelect={() => undefined} hideOnSelect={false}>
                        Third option
                    </MenuItem>
                </MenuList>
            </Menu>,
        )

        // 'First option' closes the menu
        userEvent.click(screen.getByRole('button', { name: 'Options menu' }))
        userEvent.click(screen.getByRole('menuitem', { name: 'First option' }))
        expect(screen.queryByRole('menu')).not.toBeInTheDocument()
        expect(screen.queryByRole('menuitem')).not.toBeInTheDocument()

        // 'Second option' does not close the menu
        userEvent.click(screen.getByRole('button', { name: 'Options menu' }))
        userEvent.click(screen.getByRole('menuitem', { name: 'Second option' }))
        expect(screen.getByRole('menu')).toBeInTheDocument()

        // 'Third option' does not close the menu
        userEvent.click(screen.getByRole('menuitem', { name: 'Third option' }))
        expect(screen.getByRole('menu')).toBeInTheDocument()
    })

    it("calls the onSelect and the menu's onItemSelect with the value when menu items are selected", () => {
        const onItemSelect = jest.fn()
        const onSelect = jest.fn<void, [string]>()

        render(
            <Menu onItemSelect={onItemSelect}>
                <MenuButton>Options menu</MenuButton>
                <MenuList aria-label="Some options">
                    <MenuItem value="1st" onSelect={() => onSelect('1st option')}>
                        1st option
                    </MenuItem>
                    <MenuItem value="2nd" onSelect={() => onSelect('2nd option')}>
                        2nd option
                    </MenuItem>
                </MenuList>
            </Menu>,
        )

        for (const opt of ['1st', '2nd']) {
            userEvent.click(screen.getByRole('button', { name: 'Options menu' }))
            userEvent.click(screen.getByRole('menuitem', { name: `${opt} option` }))
            expect(onItemSelect).toHaveBeenCalledWith(opt)
            expect(onSelect).toHaveBeenCalledWith(`${opt} option`)
        }

        expect(onItemSelect).toHaveBeenCalledTimes(2)
        expect(onSelect).toHaveBeenCalledTimes(2)
    })

    it('allows to navigate through the menu items using the keyboard', () => {
        const onItemSelect = jest.fn()
        const onSelect = jest.fn<void, [string]>()

        render(
            <Menu onItemSelect={onItemSelect}>
                <MenuButton>Options menu</MenuButton>
                <MenuList aria-label="Some options">
                    <MenuItem value="1st" onSelect={() => onSelect('1st option')}>
                        1st option
                    </MenuItem>
                    <MenuItem value="2nd" onSelect={() => onSelect('2nd option')}>
                        2nd option
                    </MenuItem>
                    <MenuItem value="3rd" onSelect={() => onSelect('3rd option')}>
                        3rd option
                    </MenuItem>
                </MenuList>
            </Menu>,
        )

        userEvent.type(screen.getByRole('button', { name: 'Options menu' }), '{enter}')
        fireEvent.keyDown(getFocusedElement(), { key: 'ArrowDown' })
        expect(screen.getByRole('menuitem', { name: '1st option' })).toHaveFocus()
        fireEvent.keyDown(getFocusedElement(), { key: 'ArrowDown' })
        fireEvent.keyDown(getFocusedElement(), { key: 'ArrowDown' })
        expect(screen.getByRole('menuitem', { name: '3rd option' })).toHaveFocus()
        fireEvent.keyDown(getFocusedElement(), { key: 'ArrowUp' })
        expect(screen.getByRole('menuitem', { name: '2nd option' })).toHaveFocus()
        fireEvent.keyDown(getFocusedElement(), { key: 'Enter' })
        expect(onSelect).toHaveBeenCalledWith('2nd option')
        expect(onItemSelect).toHaveBeenCalledWith('2nd')
        expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })

    it('allows to render a menu item as a link', () => {
        render(
            <Menu>
                <MenuButton>Links</MenuButton>
                <MenuList aria-label="Some options">
                    <MenuItem as="a" href="https://github.com/Doist/reactist">
                        Github repo
                    </MenuItem>
                </MenuList>
            </Menu>,
        )
        userEvent.click(screen.getByRole('button', { name: 'Links' }))
        const menuItem = screen.getByRole('menuitem', { name: 'Github repo' })
        expect(menuItem).toHaveAttribute('href', 'https://github.com/Doist/reactist')
        expect(menuItem.tagName).toEqual('A')
        // no need to test that clicking a link triggers navigation, and also navigation is not
        // supported in jsdom, so we'd need to mock window.location or something
    })

    it('allows to intercept clicks and prevent the onSelect action to occur', () => {
        const onSelect = jest.fn()
        render(
            <Menu>
                <MenuButton>Options menu</MenuButton>
                <MenuList aria-label="Some options">
                    <MenuItem
                        onClick={(event: React.MouseEvent) => event.preventDefault()}
                        onSelect={() => onSelect()}
                    >
                        Click me
                    </MenuItem>
                </MenuList>
            </Menu>,
        )

        userEvent.click(screen.getByRole('button', { name: 'Options menu' }))
        userEvent.click(screen.getByRole('menuitem', { name: 'Click me' }))
        expect(onSelect).not.toHaveBeenCalled()

        // Check that it closed the menu anyway
        expect(screen.queryByRole('menu')).not.toBeInTheDocument()
        expect(screen.queryByRole('menuitem')).not.toBeInTheDocument()
    })

    describe('a11y', () => {
        it('renders with no a11y violations', async () => {
            const { container } = render(
                <Menu>
                    <MenuButton>Options menu</MenuButton>
                    <MenuList aria-label="Some options">
                        <MenuItem>First option</MenuItem>
                    </MenuList>
                </Menu>,
            )
            const results = await axe(container)

            expect(results).toHaveNoViolations()
        })

        it('renders with no a11y violations while open', async () => {
            const { container } = render(
                <Menu>
                    <MenuButton>Options menu</MenuButton>
                    <MenuList aria-label="Some options">
                        <MenuItem onSelect={() => undefined}>First option</MenuItem>
                    </MenuList>
                </Menu>,
            )

            // Open menu
            userEvent.click(screen.getByRole('button', { name: 'Options menu' }))

            const results = await axe(container)
            expect(results).toHaveNoViolations()
        })

        it('focuses on the MenuButton when Menu closes', () => {
            const { container } = render(
                <Menu>
                    <MenuButton>Options menu</MenuButton>
                    <MenuList aria-label="Some options">
                        <MenuItem onSelect={() => undefined}>First option</MenuItem>
                    </MenuList>
                </Menu>,
            )

            // Open menu
            userEvent.click(screen.getByRole('button', { name: 'Options menu' }))

            // Close menu
            userEvent.type(container, '{esc}')

            expect(screen.getByRole('button', { name: 'Options menu' })).toHaveFocus()
        })
    })
})
