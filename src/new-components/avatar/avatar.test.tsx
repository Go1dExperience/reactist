import { render, screen } from '@testing-library/react'
import React from 'react'

import { Avatar } from './avatar'

describe('Avatar', () => {
    it('renders a background image when avatarUrl is supplied', () => {
        render(getAvatar({ avatarUrl: 'https://foo.bar/com.png' }))

        const avatar = screen.getByTestId('avatar')

        expect(avatar).toMatchSnapshot()
    })

    it('renders initials of user name when avatarUrl is not supplied', () => {
        render(getAvatar())

        const avatar = screen.getByTestId('avatar')

        expect(avatar).toHaveTextContent('HM')
    })

    it('renders initials of user email when avatarUrl is not supplied', () => {
        render(getAvatar({ user: { email: 'henning@doist.com' } }))

        const avatar = screen.getByTestId('avatar')

        expect(avatar).toHaveTextContent('H')
    })

    it('supports responsive values', () => {
        render(
            getAvatar({
                size: {
                    mobile: 's',
                    desktop: 'xl',
                    tablet: 'xxl',
                },
            }),
        )
        const avatar = screen.getByTestId('avatar')

        expect(avatar).toHaveClass('size-s')
        expect(avatar).toHaveClass('desktop-size-xl')
        expect(avatar).toHaveClass('tablet-size-xxl')
    })

    // Helpers ================================================================
    const getAvatar = (
        props?: Omit<React.ComponentProps<typeof Avatar>, 'user'> & {
            user?: { name?: string; email: string }
        },
    ) => (
        <Avatar
            data-testid="avatar"
            user={{ name: 'Henning Mus', email: 'henning@doist.com' }}
            size="xl"
            {...props}
        />
    )
})
