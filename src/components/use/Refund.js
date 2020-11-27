import React from 'react';
import classNames from 'classnames/bind';
import { Backdrop } from '@material-ui/core';

import { numberFormat } from '../../lib/formatter';

import BasicButton from '../../components/button/BasicButton';

import styles from './Refund.module.scss';

const cx = classNames.bind(styles);

const Info = ({ attribute, value, black }) => {
    return (
        <div className={cx('attribute-wrapper')}>
            <div
                className={cx('attribute', { black: black })}
                style={{ fontSize: '14px' }}
            >
                {attribute}
            </div>
            <div className={cx('value', { black: black })}>{value}원</div>
        </div>
    );
};

const Refund = ({ open, handleClose }) => {
    return (
        <>
            <div className={cx('bottom-modal', { on: open })}>
                <div className={cx('title')}>대여 취소 신청</div>
                <Info attribute={'대여비'} value={numberFormat(60000)} />
                <Info attribute={'보증금'} value={numberFormat(10000)} />
                <Info attribute={'쿠폰 할인'} value={numberFormat(-1000)} />
                <Info attribute={'포인트 할인'} value={numberFormat(-1000)} />
                <Info
                    attribute={'최종 환불금액'}
                    value={numberFormat(68000)}
                    black={true}
                />

                <div className={cx('button-area')}>
                    <BasicButton
                        button_name={`${numberFormat(68000)}원 환불신청`}
                        disable={false}
                    />
                </div>
            </div>

            <Backdrop open={open} className={cx('dim')} onClick={handleClose} />
        </>
    );
};

export default Refund;