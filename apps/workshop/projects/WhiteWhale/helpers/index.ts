import { Context, FetchUserPositionsContext } from '@defiyield/sandbox';

export const factory = 'juno14m9rd2trjytvxvu4ldmqvru50ffxsafs8kequmfky7jh97uyqrxqs5xrnx';

interface IPairsResponse {
  data: {
    pairs: IPair[];
  };
}

interface IPair {
  asset_infos: {
    native_token?: {
      denom: string;
    };
    token?: {
      contract_addr: string;
    };
  }[];
  contract_addr: string;
  liquidity_token: string;
}

interface IContractInfoResponse {
  data: IPair;
}

interface IPairResponse {
  data: {
    assets: {
      info: {
        native_token?: {
          denom: string;
        };
        token?: {
          contract_addr: string;
        };
      };
      amount: string;
    }[];
    total_share: string;
  };
}

const join = (...parts: string[]): string =>
  parts
    .join('/')
    .split('/')
    .filter(Boolean)
    .join('/')
    .replace(/(http(s?)):\//, '$1://');

export async function getContracts({ axios, endpoint }: Context) {
  const message = { pairs: {} };
  const segment = getMessageUrl(factory, message);

  const url = join(endpoint, segment);
  const { data } = await axios.get<IPairsResponse>(url);

  return data.data.pairs.map((pair) => pair.contract_addr);
}

export async function getContractInfo(
  address: string,
  { axios, endpoint }: Pick<Context, 'axios' | 'endpoint'>,
) {
  const message = { pair: {} };
  const segment = getMessageUrl(address, message);

  const url = join(endpoint, segment);
  const { data } = await axios.get<IContractInfoResponse>(url);

  return data.data;
}

export async function getPoolInfo(
  address: string,
  { axios, endpoint }: Pick<Context, 'axios' | 'endpoint'>,
) {
  const message = { pool: {} };
  const segment = getMessageUrl(address, message);

  const url = join(endpoint, segment);
  const { data } = await axios.get<IPairResponse>(url);

  return data.data;
}

export async function getBalance(contract: string, ctx: FetchUserPositionsContext) {
  const message = { balance: { address: ctx.user } };
  const segment = getMessageUrl(contract, message);

  const url = join(ctx.endpoint, segment);
  const { data } = await ctx.axios.get(url);

  return Number(data.data.balance);
}

export function getMessageUrl(contract: string, message: Record<string, any>) {
  const enocodedQuery = Buffer.from(JSON.stringify(message)).toString('base64');
  return `/cosmwasm/wasm/v1/contract/${contract}/smart/${enocodedQuery}`;
}
