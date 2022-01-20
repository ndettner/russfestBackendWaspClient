// Copyright 2020 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

// (Re-)generated by schema tool
// >>>> DO NOT CHANGE THIS FILE! <<<<
// Change the json schema instead

export const ScName        = "russfest";
export const ScDescription = "Central Smart Contract to handle Russfest interactions";

export const ParamNewSCAdress  = "NewSCAdress";
export const ParamSCAddress    = "SCAddress";
export const ParamShopOwnerID  = "ShopOwnerID";
export const ParamFee          = "fee";
export const ParamMusician     = "musician";
export const ParamMusicianName = "musicianName";
export const ParamName         = "name";
export const ParamNewHname     = "newHname";
export const ParamNewOwner     = "newOwner";
export const ParamNewfee       = "newfee";
export const ParamOwner        = "owner";
export const ParamProduct      = "product";
export const ParamProductType  = "productType";
export const ParamShop         = "shop";
export const ParamShopHname    = "shopHname";
export const ParamShopName     = "shopName";
export const ParamShopOwner    = "shopOwner";

export const ResultCanProduce           = "canProduce";
export const ResultDeniedShopRequests   = "deniedShopRequests";
export const ResultMessage              = "message";
export const ResultMusicians            = "musicians";
export const ResultMusiciansWithoutShop = "musiciansWithoutShop";
export const ResultOpenShopRequest      = "openShopRequest";
export const ResultOwner                = "owner";
export const ResultPingSuccessful       = "pingSuccessful";
export const ResultProducts             = "products";
export const ResultTimeslots            = "timeslots";

export const StateShops       = "Shops";
export const StateEarnedMoney = "earnedMoney";
export const StateMusicians   = "musicians";
export const StateOwner       = "owner";
export const StateProducts    = "products";
export const StateShopnames   = "shopnames";
export const StateTimeslots   = "timeslots";

export const FuncAcceptShop              = "acceptShop";
export const FuncAddMusician             = "addMusician";
export const FuncBuyMerch                = "buyMerch";
export const FuncCallCheckProduct        = "callCheckProduct";
export const FuncCallPayStore            = "callPayStore";
export const FuncCallPingShop            = "callPingShop";
export const FuncCancelShopRequest       = "cancelShopRequest";
export const FuncDenyShop                = "denyShop";
export const FuncInit                    = "init";
export const FuncRequestShopLicence      = "requestShopLicence";
export const FuncSetOwner                = "setOwner";
export const FuncUpdateDeniedShopRequest = "updateDeniedShopRequest";
export const ViewGetAllOpenShopRequests  = "getAllOpenShopRequests";
export const ViewGetAllProducts          = "getAllProducts";
export const ViewGetDeniedShopRequests   = "getDeniedShopRequests";
export const ViewGetMusicians            = "getMusicians";
export const ViewGetMusiciansWithoutShop = "getMusiciansWithoutShop";
export const ViewGetOpenShopRequest      = "getOpenShopRequest";
export const ViewGetOwner                = "getOwner";
export const ViewGetSpecificProducts     = "getSpecificProducts";
export const ViewGetTimeslots            = "getTimeslots";