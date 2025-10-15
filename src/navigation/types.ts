export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainStackParamList = {
  Home: undefined;
  Detail: { mal_id: number };
  Profile: undefined;
  CategoryList: {
    category: string;
    title: string;
  };
};
