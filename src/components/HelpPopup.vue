<template>
  <Popup :id='id' ref="helpPopup" header="About VETO" :hide-confirm-button="true">
    <template #popup-body>
      <span class="help-site">

        <!-- What is VETO? -->
        <div class="help-box">
          <div id="about_veto" class="help-header">1. What is VETO?</div>
          <div class="help-section">
            VETO (Verified Text Annotation Tool) is a free software for labeling texts in order to use these texts to train large language models.
            The application supports to label certain areas of a text as values of an attribute (e.g., name, age, diagnosis).
            Besides the normal attributes, the application supports the identification of characteristics that can't be labeled as
            certain parts of the text, because they are only implicitly mentioned in the text rather than explicitly.
            Examples for these attributes are “Is the patient a smoker?” or “How many sentences does the text contain?”.
            These characteristics are referred to as 'Meta Attributes'.<br>
            <br>
            The main area of application lies in LLM's in a medical context.

            VETO can also be used for validating annotations that do already exist. The application supports to change wrong annotations or
            to mark <i>data records</i> as invalid. The user has the option to only reexport those records that are being marked as valid.
          </div>
        </div>


        <div id="help-anchors">
            <p style="text-align: center; font-size: large;">Contents</p>
            <a href="#about_veto">1. What is VETO?</a>
            <a href="#shorter_info">2. Shorter introduction</a>
            <a href="#file_structure">3. File Structure</a>
            <div style="margin-left: 1vw;">
              <a href="#file_structure_1">3.1 Raw Table-Based File Structure</a>
              <a href="#file_structure_2">3.2 VETO-Specific Table-Based File Structure</a>
              <a href="#file_structure_3">3.3 JSON File Structure</a>
              <a href="#file_structure_4">3.4 Using External Text Files</a>
            </div>
            <a href="#labeling">4. Labeling Values</a>
            <a href="#meta-attributes">5. Meta Attributes</a>
            <div style="margin-left: 1vw;">
              <a href="#meta-attributes_1">5.1 Specifying a Meta Attribute in a table-based file</a>
              <a href="#meta-attributes_2">5.2 Specifying a Meta Attribute in a Json file</a>
            </div>
            <a href="#autofixing">6. Autofixing</a>
            <a href="#file_export">7. File Export</a>
            <a href="#settings">8. Settings</a>
        </div>


        <!-- Shorter Introduction -->
        <div class="help-box">
          <div id="shorter_info" class="help-header">2. Shorter introduction</div>
          <div class="help-section">
            This manual contains detailed introductions for each of VETO's functionalities. However, if you prefer a shorter introduction into VETO refer
            to the example text that is initially loaded when opening VETO. The three functionalities "File Import", "Validation" and "File Export" are
            described right there.
          </div>
        </div>



        <!-- File Structure -->
        <div class="help-box">
          <div id="file_structure" class="help-header">3. File Structure</div>
          <div class="help-section">
            The file formats supported by VETO are the two table-based formats <i>.csv</i> and <i>.xlsx</i>, as well as <i>.json</i>.
            To successfully import data into VETO either raw table-based files or files following a VETO-specific structure can be imported.
            The table-based formats work equally in respect of their structure, while JSON-Files must have a different structure.

            <div id="file_structure_1" class="help-header">3.1 Raw Table-Based File Structure</div>
            <div class="help-section">
              In raw table-based, the column names do not have to follow a specific naming scheme.
              Instead, the column containing the text to be annotated and columns containing attributes are selected during the import.
              Columns that are not selected at all will not be considered for annotation, but are kept and available in the exported file.
            </div>

            <div id="file_structure_2" class="help-header">3.2 VETO-Specific Table-Based File Structure</div>
            <div class="help-section">
              In a VETO-specific table-based file, the rows represent a <i>data record</i> which represents the text to be annotated with its attribute values.
              The different columns represent the necessary information for each record.
              The following table explains the functionality for each kind of column.
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>Column</th>
                    <th>Syntax</th>
                    <th>Meaning</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Text column</td>
                    <td>VETO_TEXT_nameOfTheTextColumn</td>
                    <td>
                      The text column contains the single texts of each <i>data record</i>. This column requires giving it a <i>name</i> so it has
                      a meaningful name in case the <i>data records</i> are being exported without Veto-specific information
                      (learn more about this in the export chapter below).
                    </td>
                  </tr>
                  <tr>
                    <td>Check Column</td>
                    <td>VETO_CHECK</td>
                    <td>
                      Specifies if the <i>data record</i> has been validated as 'valid' by a human annotator.
                      It accepts either 'true' or 'false' as valid values.
                      (When loading a file initially, it is most likely to be false).
                    </td>
                  </tr>
                  <tr>
                    <td>Attribute Value</td>
                    <td>VETO_ATTR_VALUE_nameOfTheAttribute</td>
                    <td>
                      This column contains the attribute value of the <i>data record</i> with the given name.
                      Example: If the text was "The quick brown fox jumps over the lazy dog" this column might contain "fox"
                      for the attribute "animal". ("animal" might also have the value "dog" or "fox;dog".
                      Learn more about multi-value attributes in the corresponding chapter below.")
                    </td>
                  </tr>
                  <tr>
                    <td>Attribute Start Index</td>
                    <td>VETO_ATTR_START_nameOfTheAttribute</td>
                    <td>
                      Contains the position (counting starts at 0) in the text at which the attribute value starts.
                      Example: If "fox" was the wanted value for the attribute with the given name and "The quick brown fox jumps over the lazy dog" was the text,
                      this column contains the value "16".
                    </td>
                  </tr>
                  <tr>
                    <td>Attribute End Index</td>
                    <td>VETO_ATTR_END_nameOfTheAttribute</td>
                    <td>
                      Represents the position in the text to which the value reaches. In the example above, the cell will contain the value "18".
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div id="file_structure_3" class="help-header">3.3 JSON File Structure</div>
            <div class="help-section">
              The structure of a Veto JSON file differs from the table-based files. At the top layer, the file consists of three objects:
              The <i>attributes</i>-array and the <i>metaAttributes</i>-object contain the required metadata for the file.
              This includes the names of the annotated attributes and relevant information about the utilized meta attributes (more about that later).
              <br>
              The actual data is contained in the <i>data</i>-array in the form of JSON objects, which in turn have subfields that work similar to the columns in the table-based files:

              <div class="json-container">
                <highlightjs  language="json" code='{
  "attributes": [
    "animal"
  ],
  "data": [
    {
      "attributes": {
        "animal": {
          "value": "fox",
          "start": 16,
          "end": 18
        }
      },
      "metaAttributes": {
        "Number Of Mentioned Animals": [
          "2"
        ],
        "Language Of Text": [
          "English"
        ]
      },
      "checked": false,
      "text": "The quick brown fox jumps over the lazy dog",
      "oldAttributes": {
        "animal": {
          "value": "fox",
          "start": 16,
          "end": 18
        }
      },
      "oldMetaAttributes": {
        "Number Of Mentioned Animals": [
          "2"
        ],
        "Language Of Text": [
          "English"
        ]
      }
    }
  ],
  "metaAttributes": {
    "Number Of Mentioned Animals": {
      "type": "NUMBER"
    },
    "Language Of Text": {
      "type": "ENUM",
      "possibleValues": [
        "English",
        "German",
        "French"
      ]
    }
  }
}'/></div>
            </div>
            <div id="file_structure_4" class="help-header">3.4 Using External Text Files</div>
            <div class="help-section">
              Under some circumstances, you might want to keep the text to be annotated in a separate file. This use case is supported by VETO, although
              there are some limitations:
              <ul>
                <li>The text files must be in the same directory as the main file</li>
                <li>The main file must indicate which text files must be further loaded</li>
                <li>When importing the main file into VETO, the external text files must also be selected</li>
              </ul>
              The right way in which the external text files must be referenced depends on the utilized file structure:
              <ul>
                <li>For raw table-based files: The column selected to hold the text must now name the external text file</li>
                <li>For VETO-specific table-based files: The column that used to hold the text (VETO_TEXT_nameOfTheTextColumn) must now name the external text file</li>
                <li>
                  For JSON files: Every <i>data object</i> has to specify the file name with the key "path". The key "text" that is used when
                  no external text files are being used is forbidden then.
                  <div class="json-container">
                  <highlightjs language="json" code='{
 ...
  "checked": false,
   //Not allowed: "text": "The quick brown fox jumps over the lazy dog",
  "path": "filename.txt",
  ...
}'/></div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Labeling Values -->
        <div class="help-box">
          <div id="labeling" class="help-header">4. Labeling Values</div>
          <div class="help-section">
            In order to annotate a certain part of the text as a value of an attribute double-click the corresponding cell in the table and proceed to mark
            the right part of the text. In some cases you might want to label more than one range of the text as a value of the desired attribute.
            In this case you must first allow this by clicking the corresponding button on the top right corner of the table.
            This switches the application to the <i>"multi-value mode"</i>. Labels must now be selected in the corresponding field below the table.
            The new field also allows to to add and remove additional values via a simple button click.
            <img src="@/assets/help-popup/multi-value-button.png" alt="screenshot showing the button for enabling the multi-value mode">
          </div>
        </div>


        <!-- Meta Attributes -->
        <div class="help-box">
          <div id="meta-attributes" class="help-header">5. Meta Attributes</div>
          <div class="help-section">
            As described in the introduction of this handbook, Meta Attributes enable the user to identify characteristics that are only implicitly contained in a
            text and therefore can't be referred to as a range of the text. VETO supports the following data types as meta attributes:
            <ol>
              <li>Numbers</li>
              <li>Texts</li>
              <li>Enumerable (the user can pick the value from a list of predefined values)</li>
            </ol>
            <div id="meta-attributes_1" class="help-header">5.1 Specifying a Meta Attribute in a table-based file</div>
            <div class="help-section">
              For manually adding a Meta Attribute to a table-based file, the user has to add a new column which starts with "VETO_META_"
              followed by the type of the Meta Attribute (e.g., "VETO_META_NUMBER"). If the Meta Attribute is of type Enumerable, the user must further specify
              the possible values to be selected.
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>Meta Attribute Data Type</th>
                    <th>Meaning</th>
                    <th>Examples for a column title</th>
                    <th>How it looks like</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Number</td>
                    <td>Pick any integer number</td>
                    <td>VETO_META_NUMBER_Number-Example</td>
                    <td><img src="@/assets/help-popup/meta-number-example.png" alt="screenshot showing a numeric meta attribute in the UI"></td>
                  </tr>
                  <tr>
                    <td>Text</td>
                    <td>Input any text</td>
                    <td>VETO_META_TEXT_Text-Example</td>
                    <td><img src="@/assets/help-popup/meta-text-example.png" alt="screenshot showing an text-based meta attribute in the UI"></td>
                  </tr>
                  <tr>
                    <td>Enumerable</td>
                    <td>Pick the correct answer from a list of predefined values</td>
                    <td>VETO_META_ENUM_Enum-Example__Option1__Option2__Option3</td>
                    <td><img src="@/assets/help-popup/meta-enumerable-example.png" alt="screenshot showing an enumerable meta attribute in the UI"></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div id="meta-attributes_2" class="help-header">5.2 Specifying a Meta Attribute in a JSON file</div>
              <div class="help-section">
                <div class="help-section-flex">
                  In order to manually add a Meta Attribute to a JSON file, it must be added to the corresponding section. If the Meta Attribute is of type Enumerable,
                  the possible values must be specified in the possibleValues-Array.
                </div>
                <div class="json-container">
<highlightjs language="json" code='"metaAttributes": {
  "Number-Example": {
    "type": "NUMBER"
  },
  "Text-Example": {
    "type": "TEXT"
  },
  "Enum-Example": {
    "type": "ENUM",
    "possibleValues": [
      "Option1",
      "Option2",
      "Option3"
    ]
}'/></div>
              </div>
            </div>
        </div>

        <!-- Autofixing -->
        <div class="help-box">
          <div id="autofixing" class="help-header">6. Autofixing</div>
          <div class="help-section">
            The following values of a <i>data record</i> depend on each other:
            <ul>
              <li>The labeled range of a text referred to as the "attribute"</li>
              <li>The start- and end-indices enclosing that range</li>
            </ul>
            Even though at least the first value might be fully inferable by the latter, both of these values are included in a VETO file.
            This redundancy comes with the obvious drawback that it is possible that:
            <ul>
              <li>The correct attribute value can not be found in the text with the given indices.</li>
              <li>The correct indices refer to a part of the text that is not the attribute value from the file.</li>
            </ul>
            In either of these two cases, a red warning sign occurs right next to the affected cell in the table. By clicking on it, you can fix these problems by:
            <ul>
              <li>Setting the value using the start and end indices.</li>
              <li>Setting the start and end indices using the value.</li>
            </ul>
            You can also attempt to let VETO fix these conflicts for you by clicking on the button "Auto fix" on the upper left corner of the table.
          </div>
        </div>


        <!-- File Export -->
        <div class="help-box">
          <div id="file_export" class="help-header">7. File Export</div>
          <div class="help-section">
            After annotating your texts (or validating existing annotations) you can export an updated version of your imported file.
            However, there are still some possibilities to influence the way the file will be exported:
            <ul>
              <li>
                <u>Columns To Export</u>: There are three options available that define the file structure:
                <ul>
                  <li>
                    <u>All columns</u>:
                    All kind of attribute columns and meta information will be exported in VETO's specific structure
                    introduced in Sections <a href="#file_structure_2">3.2</a> and <a href="#meta-attributes_1">5.1</a>.
                    Additionally, columns not used for annotations are also included.
                  </li>
                  <li>
                    <u>Only VETO columns</u>:
                    The format is similar to "All columns", but the additional columns are not included.
                  </li>
                  <li>
                    <u>Without VETO columns</u>:
                    Only contains the text column and plain values of annotations and Meta Attributes.
                    Meta information (e.g., positions and the validation status) and column specifications stored in the column names will be lost.
                    For tabular files, this corresponds to the structure described in Section
                    <a href="#file_structure_1">3.1</a>.
                    <b>JSON files exported in this format cannot be imported again.</b>
                  </li>
                </ul>
              </li>
              <li>
                <u>Rows To Be Exported</u>:
                You can choose to export rows based on their validation status.
              </li>
              <li>
                <u>File Format</u>:
                Indifferently of the format of the imported file, all three supported file formats
                (<i>.csv</i>, <i>.xlsx</i> and <i>.json</i>) can be chosen.
              </li>
            </ul>
          </div>
        </div>

         <!-- Settings -->
        <div class="help-box">
          <div id="settings" class="help-header">8. Settings</div>
          <div class="help-section">
            VETO allows to make some individual settings that might increase the user experience.
            <ul>
              <li>
                After labeling a specific range of the text, the efficient user might require a specific action that should occur then.
                You can choose one of the following actions:
                <ul>
                  <li><u>Nothing (chosen by default)</u></li>
                  <li><u>Deselect after labeling:</u>
                    After you have labeled a part of the text, you won't have any attribute selected anymore.</li>
                  <li><u>Proceed with next cell after labeling:</u>
                    Automatically select the next attribute in the table. If the end of the row is reached, you'll proceed with the
                    first column of the next row.
                  </li>
                </ul>
              </li>
              <li>Choose the colors of the UI. Possible color schemes are the default color scheme or a dark color scheme</li>
              <li>Choose the colors with which the annotations are presented</li>
              <li>Keep the search active at any time, even when focusing other elements except inputs. This disables some options for keyboard shortcuts to prevent conflicts.</li>
              <li>Set which character groups are trimmed from annotations or extended to annotations.</li>
              <li>
                Modify the behavior of the autofixing feature. For example the application can optionally ignore line breaks when looking for valid ranges for a given value.
              </li>
              <li>The Keyboard Settings allow to map some well-chosen keys with supported actions</li>
            </ul>
          </div>
        </div>
      </span>
    </template>
  </Popup>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import Popup from "@/components/Popup.vue";

export default defineComponent({
  name: "HelpPopup",
  props: ["id"],
  emits: ['close'],
  components: {
    Popup
  },
  methods: {
    // Wird von außen zum Öffnen des Popups aufgerufen
    open() {
      (this.$refs['helpPopup'] as typeof Popup).open();
    }
  },
});
</script>

<style scoped>

#help-anchors {
  border: 1px solid var(--veto-color-border);
  border-radius: 3px;

  padding: 20px;
  margin: 2vh auto 2vh 2vw;

  width: fit-content;
}

#help-anchors a{
  text-decoration: none;
  display: block;

  color: var(--veto-color-main)
}

.help-site {
  display: flex;
  flex-direction: column;
}

.help-border > :nth-child(2n){
  border-left: solid;
  border-width: 1px;
  border-color: var(--veto-color-border);
}

.help-box .help-header {
  font-size: 1.5em;
}

.help-box .help-section {
  margin-left: 3vh;
}

.help-box {
  margin-bottom: 20px;
}

.help-section-flex {
  display: flex;
}

.help-images {
  max-height: 30vh;
  max-width: 90%;
  display: block;
  object-fit: contain;
  object-position: 0% 100%;
  margin-left: 3vw;
}

.json-container {
  max-height: 50vh;
  max-width: 30vw;
  overflow: scroll;

  border: 1px solid;
  border-color: var(--veto-color-border);
  border-radius: 3px;
}

table.table * {
  color: var(--veto-color-font)
}

</style>
