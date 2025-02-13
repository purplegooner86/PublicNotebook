import { Box, Button, TextField } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";

import { DatePicker } from '@mui/x-date-pickers'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from "dayjs"

import axios from "axios"

const Form = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");

  const handleFormSubmit = async (values, actions) => {
    const butterflyListValues = {
      species: values.species.toLowerCase(),
      wingspan: values.wingspan,
      color: values.color.toLowerCase(),
      date: values.selectdate.toDate(),
    }

    axios.post(process.env.REACT_APP_BACKEND_URL + '/api/butterflieslist', butterflyListValues)
    .then(res => console.log(res));

    await new Promise((resolve) => setTimeout(resolve, 1000));
    actions.resetForm();
  };

  return (
    <Box m="20px">
      <Header title="Add Butterfly" subtitle="Add a newly observed butterfly" />

      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={checkoutSchema}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
          setFieldValue,
          isSubmitting,
        }) => (
          <form onSubmit={handleSubmit}>
            <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
              sx={{
                "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
              }}
            >
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Species"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.species}
                name="species"
                error={!!touched.species && !!errors.species}
                helperText={touched.species && errors.species}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Wing Span"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.wingspan}
                name="wingspan"
                error={!!touched.wingspan && !!errors.wingspan}
                helperText={touched.wingspan && errors.wingspan}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Color"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.color}
                name="color"
                error={!!touched.color && !!errors.color}
                helperText={touched.color && errors.color}
                sx={{ gridColumn: "span 4" }}
              />
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Date Observed"
                  onChange={(value) => setFieldValue("selectdate", value, true)}
                  value={values.selectdate ?? dayjs()}
                  defaultValue={dayjs()}
                  minDate={dayjs(new Date(1990, 0, 1))}
                  maxDate={dayjs(new Date())}
                  slotProps={{
                    textField: {
                      readOnly: true,
                    }
                  }}
                />
              </LocalizationProvider>
            </Box>
            <Box display="flex" justifyContent="end" mt="20px">
              <Button disabled={isSubmitting} type="submit" color="secondary" variant="contained">
                Add New Butterfly
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

const checkoutSchema = yup.object().shape({
  species: yup.string().required("required"),
  wingspan: yup.number().required("required"),
  color: yup.string().required("required"),
  selectdate: yup.date().required("required"),
});

const initialValues = {
  species: "",
  wingspan: 0,
  color: "",
  selectdate: dayjs(),
};

export default Form;
