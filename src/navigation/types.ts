export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  Detail: { mal_id: number };
  CategoryList: {
    category: string;
    title: string;
  };
};
