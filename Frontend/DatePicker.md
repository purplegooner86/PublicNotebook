## Install

```sh
npm i dayjs @mui/x-date-pickers
```

## Frontend Form

```JS
import { DatePicker } from '@mui/x-date-pickers'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from "dayjs"

const handleFormSubmit = (values) => {
    const submitValues = {
        date: values.selectdate.toDate(),
    }
    // ...
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
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                            label="Date Observed"
                            onChange={(value) => setFieldValue("selectdate", value, true)}
                            value={values.selectdate ?? dayjs()}
                            defaultValue={dayjs()}
                            />
                        </LocalizationProvider>
                    </Box>
                </form>
            )}
        </Formik>
    </Box>
);

const checkoutSchema = yup.object().shape({
  selectdate: yup.date().required("required"),
});

const initialValues = {
  selectdate: dayjs(),
};
```


