import { WidgetType } from "../../generated/client/client";

export class WidgetTypeService {
  async getAllWidgetTypes() {
    return Object.values(WidgetType).map(type => ({
      name: type,
      description: `Widget type for ${type}`,
    }));
  }
}
