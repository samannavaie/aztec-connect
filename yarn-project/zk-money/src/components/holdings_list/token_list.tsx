import { AssetValue } from '@aztec/sdk';
import { recipeFiltersToSearchStr } from '../../alt-model/defi/recipe_filters.js';
import { RemoteAsset } from '../../alt-model/types.js';
import { Pagination } from '../../components/pagination.js';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HOLDINGS_PER_PAGE, slicePage } from './helpers.js';
import { Holding } from './holding.js';
import { PendingBalances, usePendingBalances } from '../../alt-model/assets/l1_balance_hooks.js';
import style from './token_list.module.scss';

interface TokenListProps {
  balances: AssetValue[] | undefined;
  onOpenShieldModal: (assetId: number) => void;
  onOpenSendModal: (assetId: number) => void;
}

function generateBalances(pendingBalances?: PendingBalances, balances?: AssetValue[]) {
  if (!pendingBalances) return balances;

  const allBalances = balances ? [...balances] : [];
  Object.keys(pendingBalances).forEach(pendingAssetId => {
    const balance = allBalances.find(balance => balance.assetId === Number(pendingAssetId));
    if (!balance) {
      allBalances.push({ assetId: Number(pendingAssetId), value: 0n });
    }
  });
  return allBalances;
}

export function TokenList(props: TokenListProps) {
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const pendingBalances = usePendingBalances();

  const handleGoToEarn = (asset: RemoteAsset) => {
    const searchStr = recipeFiltersToSearchStr({ assetSymbol: asset.symbol });
    navigate(`/earn${searchStr}`);
  };

  const allBalances = generateBalances(pendingBalances, props.balances);

  if (!allBalances) return <></>;
  if (allBalances.length === 0) {
    return <div className={style.noTokens}>You have no tokens yet</div>;
  }

  return (
    <>
      {slicePage(allBalances ?? [], page).map(balance => {
        const { assetId } = balance;
        return (
          <Holding
            key={assetId}
            assetValue={balance}
            onSend={() => props.onOpenSendModal(assetId)}
            onShield={() => props.onOpenShieldModal(assetId)}
            onGoToEarn={handleGoToEarn}
          />
        );
      })}
      {allBalances.length > HOLDINGS_PER_PAGE && (
        <Pagination
          totalItems={allBalances?.length ?? 0}
          itemsPerPage={HOLDINGS_PER_PAGE}
          page={page}
          onChangePage={setPage}
        />
      )}
    </>
  );
}
