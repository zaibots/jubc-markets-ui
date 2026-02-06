import { Trans } from '@lingui/macro';
import { BasicModal } from 'src/components/primitives/BasicModal';
import { ModalContextType, ModalType, useModalContext } from 'src/hooks/useModal';

import { ModalWrapper } from '../FlowCommons/ModalWrapper';
import { SavingsAienModalDepositContent } from './SavingsAienModalDepositContent';

export const SavingsAienDepositModal = () => {
  const { type, close, args } = useModalContext() as ModalContextType<{
    underlyingAsset: string;
  }>;

  return (
    <BasicModal open={type === ModalType.SavingsAienDeposit} setOpen={close}>
      <ModalWrapper
        title={<Trans>Deposit AIEN</Trans>}
        underlyingAsset={args.underlyingAsset}
        hideTitleSymbol
      >
        {() => <SavingsAienModalDepositContent />}
      </ModalWrapper>
    </BasicModal>
  );
};
