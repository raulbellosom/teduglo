import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Icon } from "react-native-elements";
import {
  Calendar,
  CalendarList,
  Agenda,
  LocaleConfig,
} from "react-native-calendars";

export default function Calendario(props) {
  const { setShowModal } = props;
  LocaleConfig.locales["es"] = {
    monthNames: [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ],
    monthNamesShort: [
      "Ene.",
      "Feb.",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul.",
      "Ago",
      "Sept.",
      "Oct.",
      "Nov.",
      "Dic.",
    ],
    dayNames: [
      "Domingo",
      "Lunes",
      "Martes",
      "Miercoles",
      "Jueves",
      "Viernes",
      "Sabado",
    ],
    dayNamesShort: ["Dom.", "Lun.", "Mar.", "Mir.", "Jue.", "Vie.", "Sab."],
    today: "Hoy",
  };
  LocaleConfig.defaultLocale = "es";

  return (
    <View>
      <Calendar
        // Initially visible month. Default = Date()
        current={"2021-01-01"}
        // Minimum date that can be selected, dates before minDate will be grayed out. Default = undefined
        minDate={(day) => {
          day;
        }}
        // Maximum date that can be selected, dates after maxDate will be grayed out. Default = undefined
        maxDate={"2025-05-30"}
        // Handler which gets executed on day press. Default = undefined
        onDayPress={(day) => {
          console.log("selected day", day);
        }}
        // Handler which gets executed on day long press. Default = undefined
        onDayLongPress={(day) => {
          console.log("selected day", day);
        }}
        // Month format in calendar title. Formatting values: http://arshaw.com/xdate/#Formatting
        monthFormat={"yyyy MM"}
        // Handler which gets executed when visible month changes in calendar. Default = undefined
        onMonthChange={(month) => {
          console.log("month changed", month);
        }}
        // Hide month navigation arrows. Default = false
        hideArrows={false}
        // Replace default arrows with custom ones (direction can be 'left' or 'right')
        renderArrow={(direction) => <Arrow direction={direction} />}
        // Do not show days of other months in month page. Default = false
        hideExtraDays={false}
        // If hideArrows=false and hideExtraDays=false do not switch month when tapping on greyed out
        // day from another month that is visible in calendar page. Default = false
        disableMonthChange={false}
        // If firstDay=1 week starts from Monday. Note that dayNames and dayNamesShort should still start from Sunday.
        firstDay={1}
        // Hide day names. Default = false
        hideDayNames={false}
        // Show week numbers to the left. Default = false
        showWeekNumbers={false}
        // Handler which gets executed when press arrow icon left. It receive a callback can go back month
        onPressArrowLeft={(subtractMonth) => subtractMonth()}
        // Handler which gets executed when press arrow icon right. It receive a callback can go next month
        onPressArrowRight={(addMonth) => addMonth()}
        // Disable left arrow. Default = false
        disableArrowLeft={false}
        // Disable right arrow. Default = false
        disableArrowRight={false}
        // Disable all touch events for disabled days. can be override with disableTouchEvent in markedDates
        disableAllTouchEventsForDisabledDays={true}
        // Replace default month and year title with custom one. the function receive a date as parameter.
        renderHeader={(date) => {
          /*Return JSX*/
        }}
        // Enable the option to swipe between months. Default = false
        enableSwipeMonths={true}
      />
      <Text></Text>
    </View>
  );
}

function Arrow(direction) {
  return <Icon type="material-community" name="chevron-left" />;
}

function RenderArrow(direction) {
  let iconName;
  switch (direction) {
    case "left":
      iconName = "chevron-left";
      break;
    case "right":
      iconName = "chevron-right";
  }
  return <Icon type="material-community" name={iconName} />;
}

function ArrowLeft() {
  return <Icon type="material-community" name="chevron-left" />;
}
function ArrowRight() {
  return <Icon type="material-community" name="chevron-right" />;
}

const styles = StyleSheet.create({});
