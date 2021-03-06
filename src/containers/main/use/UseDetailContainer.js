import React, { useCallback, useEffect, useReducer, useState } from 'react';
import qs from 'qs';
import { Link, useHistory } from 'react-router-dom';

import BasicButton from '../../../components/button/BasicButton';
import Refund from '../../../components/use/Refund';
import ImageModal from '../../../components/modal/ImageModal';
import PullToRefreshContainer from '../../../components/assets/PullToRefreshContainer';

import { useDialog } from '../../../hooks/useDialog';
import useToken from '../../../hooks/useToken';
import useLoading from '../../../hooks/useLoading';
import useModal from '../../../hooks/useModal';
import { useScrollStart } from '../../../hooks/useScroll';

import { requestGetDetailUseRental } from '../../../api/rental';

import { getFormatDateTime } from '../../../lib/calculateDate';
import { numberFormat, stringToTel } from '../../../lib/formatter';
import { rentalStatus } from '../../../lib/rentalStatus';
import { paymentType } from '../../../lib/paymentType';
import { isEmpty } from '../../../lib/formatChecker';
import { imageFormat } from '../../../lib/formatter';

import { Paths } from '../../../paths';

import classnames from 'classnames/bind';
import { ButtonBase, IconButton } from '@material-ui/core';
import styles from './UseDetailContainer.module.scss';
import Tel from '../../../static/asset/svg/use/Tel';
import MessageBox from '../../../static/asset/svg/use/MessageBox';
import XButton from '../../../static/asset/svg/auth/XButton';

const cx = classnames.bind(styles);

const Info = ({ attribute, value, black }) => {
    return (
        <div className={cx('attribute-wrapper')}>
            <div className={cx('attribute')}>{attribute}</div>
            <div className={cx('value', { black: black })}>{value}</div>
        </div>
    );
};

const Button = ({ name, disable, onClick, addition, children }) => {
    return (
        !disable && (
            <ButtonBase
                onClick={onClick}
                style={addition ? { width: '100%' } : {}}
            >
                {children}
                {name}
            </ButtonBase>
        )
    );
};

const UseDetailContainer = ({ match, location }) => {
    const token = useToken();
    const history = useHistory();
    const openDialog = useDialog();
    const [order, setOrder] = useState({});
    const [review, setReview] = useState();
    const [status, setStatus] = useState(false);
    const [onLoading, offLoading] = useLoading();
    const isTop = useScrollStart();

    const query = qs.parse(location.search, {
        ignoreQueryPrefix: true,
    });

    const { rental_id, from_list, place_id } = query;

    const [modalState, dispatchHandle] = useReducer(
        (state, action) => {
            return {
                ...state,
                [action.type]: action.payload,
            };
        },
        { refund: false },
    );

    const { url, params } = match;
    const [isOpenImageView, handleImageView] = useModal(
        url,
        params.modal,
        `image_view?place_id=${place_id}`,
    );

    const getUseDetail = useCallback(async () => {
        onLoading('getUseDetail');
        try {
            const {
                msg,
                order,
                review,
                prev_order,
            } = await requestGetDetailUseRental(rental_id);

            if (msg === 'success') {
                setOrder(order, prev_order);
                setReview(review);
                if (
                    rentalStatus(order) === '????????????' ||
                    rentalStatus(order) === '????????????'
                )
                    setStatus(true);
            } else {
                openDialog(msg);
            }
        } catch (e) {
            console.error(e);
        }
        offLoading('getUseDetail');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rental_id, openDialog]);

    useEffect(() => {
        if (token !== null) getUseDetail();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        !isEmpty(order) && (
            <PullToRefreshContainer
                onRefresh={getUseDetail}
                isTop={isTop}
            >
                <div className={cx('container', 'top')}>
                    <div className={cx('title-area')}>
                        <div className={cx('title')}>
                            {order.place.place_name}
                        </div>
                        <div className={cx('rental-status')}>
                            {rentalStatus(order)}
                        </div>
                    </div>
                    <IconButton
                        className={cx('x-button')}
                        onClick={() => {
                            if (from_list) history.goBack();
                            else history.replace(Paths.main.use.list);
                        }}
                    >
                        <XButton />
                    </IconButton>
                    <div className={cx('card')}>
                        <ButtonBase
                            component="div"
                            className={cx('card-img')}
                            style={{
                                backgroundImage: `url('${imageFormat(
                                    order.place.place_images[0],
                                )}')`,
                            }}
                            onClick={handleImageView}
                        />
                        <div className={cx('card-title')}>?????? ?????? ??????</div>

                        <div className={cx('content-area')}>
                            <Info
                                attribute={'?????? ?????? ??????'}
                                value={order.place.place_name}
                            />
                            <Info
                                attribute={'????????????'}
                                value={`${getFormatDateTime(
                                    order.rental_start_time,
                                )} ~ ${getFormatDateTime(
                                    order.rental_end_time,
                                )}`}
                                black={true}
                            />
                            <Info
                                attribute={'????????????'}
                                value={`${getFormatDateTime(
                                    order.place.oper_start_time,
                                )} ~ ${getFormatDateTime(
                                    order.place.oper_end_time,
                                )}`}
                            />
                            <Info
                                attribute={'????????????'}
                                value={`30?????? ${numberFormat(
                                    order.place.place_fee,
                                )}???`}
                                black={true}
                            />
                            <Info
                                attribute={'????????? ?????????'}
                                value={stringToTel(order.user.phone_number)}
                                black={true}
                            />
                            <Info
                                attribute={'?????? ????????? ?????????'}
                                value={
                                    order.user
                                        ? stringToTel(order.user.phone_number)
                                        : '-'
                                }
                            />
                        </div>

                        <div className={cx('button-area')}>
                            <Button
                                name={'???????????? ??????'}
                                addition={
                                    rentalStatus(order) !== '????????????'
                                }
                            >
                                <Tel />
                            </Button>
                            <Button
                                name={`?????? ${review ? '??????' : '??????'} ??????`}
                                disable={
                                    rentalStatus(order) !== '????????????'
                                }
                                onClick={() =>
                                    review
                                        ? history.push(
                                              Paths.main.review.modify +
                                                  `?rental_id=${rental_id}`,
                                          )
                                        : history.push(
                                              Paths.main.review.write +
                                                  `?rental_id=${rental_id}`,
                                          )
                                }
                            >
                                <MessageBox />
                            </Button>
                        </div>
                    </div>
                </div>

                {(order.coupon || order.point_price !== 0) && (
                    <>
                        <div className={cx('bar')} />
                        <div className={cx('container')}>
                            <div className={cx('discount-area')}>
                                <div className={cx('discount-title')}>
                                    ?????? ??????
                                </div>
                                <div className={cx('content-area')}>
                                    {order.coupon && (
                                        <>
                                            <Info
                                                attribute={'?????? ??????'}
                                                value={`${order.coupon.cp_subject}`}
                                            />
                                            <Info
                                                attribute={'?????? ??????'}
                                                value={`${numberFormat(
                                                    order.coupon.cp_price,
                                                )}???`}
                                                black={true}
                                            />
                                        </>
                                    )}

                                    {order.point_price !== 0 && (
                                        <Info
                                            attribute={'????????? ??????'}
                                            value={`${numberFormat(
                                                order.point_price,
                                            )}???`}
                                            black={true}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                <div className={cx('bar')} />

                <div className={cx('container')}>
                    <div className={cx('discount-area')}>
                        <div className={cx('discount-title')}>?????? ??????</div>
                        <div className={cx('content-area')}>
                            <Info
                                attribute={'?????? ??????'}
                                value={getFormatDateTime(order.createdAt)}
                            />
                            <Info
                                attribute={'????????????'}
                                value={paymentType(order.payment_type)}
                                black={true}
                            />
                            <Info
                                attribute={'????????????'}
                                value={`${numberFormat(order.payment_price)}???`}
                                black={true}
                            />
                        </div>
                    </div>

                    <div className={cx('button-area')}>
                        {rentalStatus(order) !== '?????????' && (
                            <BasicButton
                                button_name={
                                    status
                                        ? rentalStatus(order)
                                        : '?????? ????????????'
                                }
                                disable={status}
                                color={status ? 'black' : 'white'}
                                onClick={() =>
                                    !status &&
                                    dispatchHandle({
                                        type: 'refund',
                                        payload: true,
                                    })
                                }
                            />
                        )}
                        {!status && (
                            <Link
                                to={
                                    Paths.main.use.extend +
                                    `?rental_id=${rental_id}`
                                }
                            >
                                <BasicButton
                                    button_name={'?????? ??????'}
                                    disable={status}
                                />
                            </Link>
                        )}
                    </div>
                </div>

                <Refund
                    open={modalState.refund}
                    handleClose={() =>
                        dispatchHandle({ type: 'refund', payload: false })
                    }
                    rentalID={rental_id}
                    paymentPrice={order.total_price}
                    deposit={order.deposit}
                    couponPrice={order.coupon ? order.coupon.cp_price : '-'}
                    pointPrice={order.point_price ? order.point_price : '-'}
                />
                <ImageModal
                    title={order && order.place.place_name}
                    images={order && imageFormat(order.place.place_images)}
                    open={isOpenImageView}
                    handleClose={handleImageView}
                ></ImageModal>
            </PullToRefreshContainer>
        )
    );
};

export default UseDetailContainer;
