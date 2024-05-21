import { DatePicker } from "antd";
import dateFnsGenerateConfig from "rc-picker/lib/generate/dateFns";

const DFDatePicker = DatePicker.generatePicker(dateFnsGenerateConfig);

export default DFDatePicker;
