import prisma from "../../config/prisma";

export class WidgetTypeService {
  async getAllWidgetTypes() {
    return prisma.widgetType.findMany();
  }
}
