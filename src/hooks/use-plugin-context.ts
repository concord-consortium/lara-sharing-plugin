import { createContext, useContext } from "react";
import * as PluginAPI from "@concord-consortium/lara-plugin-api";

export type IPluginContext = PluginAPI.IPluginRuntimeContext | PluginAPI.IPluginAuthoringContext;

export const PluginContext = createContext<IPluginContext>({} as IPluginContext);
