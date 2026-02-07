import { Trans } from '@lingui/macro';
import { BasicModal } from 'src/components/primitives/BasicModal';
import { ModalContextType, ModalType, useModalContext } from 'src/hooks/useModal';

import { ModalWrapper } from '../FlowCommons/ModalWrapper';
import { SavingsAienModalWithdrawContent } from './SavingsAienWithdrawModalContent';

export const SavingsAienWithdrawModal = () => {
  const { type, close, args } = useModalContext() as ModalContextType<{
    underlyingAsset: string;
  }>;

  return (
    <BasicModal open={type === ModalType.SavingsAienWithdraw} setOpen={close}>
      <ModalWrapper
        title={<Trans>Withdraw AIEN</Trans>}
        underlyingAsset={args.underlyingAsset}
        hideTitleSymbol
      >
        {(params) => <SavingsAienModalWithdrawContent {...params} icon="AIEN" />}
      </ModalWrapper>
    </BasicModal>
  );
};
