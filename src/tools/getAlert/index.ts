import type { ToolRegistration } from "@/types"
import { makeJsonSchema } from "@/utils/makeJsonSchema"
import { USER_AGENT, NWS_API_BASE } from "@/constant"
import { type GetAlertSchema, getAlertSchema } from "./schema"

interface AlertFeature {
  properties: {
    event?: string;
    areaDesc?: string;
    severity?: string;
    status?: string;
    headline?: string;
  };
}
interface AlertsResponse {
  features: AlertFeature[];
}

export const getAlert = async (args: GetAlertSchema): Promise<AlertsResponse> => {
  try {
    const response = await fetch(
      `${NWS_API_BASE}/alerts?area=${args.stateCode}`,
      {
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "application/geo+json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json() as AlertsResponse;
    return data
  } catch (error) {
    console.error("Error in getAlert:", error);
    throw new Error(`Failed to fetch weather alerts: ${(error as Error).message}`);
  }
};

// Format alert data
function formatAlert(feature: AlertFeature): string {
  const props = feature.properties;
  return [
    `Event: ${props.event || "Unknown"}`,
    `Area: ${props.areaDesc || "Unknown"}`,
    `Severity: ${props.severity || "Unknown"}`,
    `Status: ${props.status || "Unknown"}`,
    `Headline: ${props.headline || "No headline"}`,
    "---",
  ].join("\n");
}

export const getAlertTool: ToolRegistration<GetAlertSchema> = {
  name: "get_alert",
  description: "Get weather alerts for a specific US state",
  inputSchema: makeJsonSchema(getAlertSchema),
  handler: async (args: GetAlertSchema) => {
    try {
      const parsedArgs = getAlertSchema.parse(args);
      const res = await getAlert(parsedArgs);
      if (!res.features.length) {
        return {
          content: [
            {
              type: "text",
              text: `No active alerts for ${args.stateCode}`,
            },
          ],
        };
      }
      const formattedAlerts = res.features.map(formatAlert);
      const alertsText = `Active alerts for ${args.stateCode}:\n\n${formattedAlerts.join("\n")}`;
      return {
        content: [
          {
            type: "text",
            text: alertsText,
          },
        ],
      };
    } catch (error) {
      console.error("Error in getAlertTool handler:", error);
      return {
        content: [
          {
            type: "text",
            text: `Error: ${(error as Error).message}`,
          },
        ],
        isError: true,
      };
    }
  },
};